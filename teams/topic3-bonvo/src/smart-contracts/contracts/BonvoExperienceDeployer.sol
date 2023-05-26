// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "./interfaces/IBonvoUserReputation.sol";
import "./interfaces/IBonvoExperience.sol";
import "./interfaces/IBonvoExperienceDeployerHelper.sol";
import "./BonvoExperienceTicket.sol";
import "./BonvoExperience.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";

error ExperienceIdMismatch();
error NotUser();

contract BonvoExperienceDeployer is Ownable {
    event NewExperience(
        uint256 indexed experienceId,
        address indexed owner,
        address indexed ticketsContract,
        string name
    );

    struct ExperienceData {
        uint256 experienceId;
        address ticketsContract;
    }

    address private _userReputationContract;
    address private _experiencesContract;
    address private _deployerHelperContract;
    mapping(address => bool) private _isUser;
    mapping(uint256 experienceId => address ticketsContract)
        private _experienceToTicketsContract;
    mapping(address ticketsContract => uint256 experienceId)
        private _ticketsContractToExperienceId;

    uint256 private _totalExperiences;

    modifier onlyUser() {
        _checkIsUser();
        _;
    }

    constructor() {}

    function setContracts(
        address userReputationContract,
        address experiencesContract,
        address deployerHelperContract
    ) public onlyOwner {
        _userReputationContract = userReputationContract;
        _experiencesContract = experiencesContract;
        _deployerHelperContract = deployerHelperContract;
    }

    function getIsUser(address user) public view returns (bool) {
        return _isUser[user];
    }

    function totalExperiences() public view returns (uint256) {
        return _totalExperiences;
    }

    function getTicketsContract(
        uint256 experienceId
    ) public view returns (address) {
        return _experienceToTicketsContract[experienceId];
    }

    function getExperienceId(
        address ticketsContract
    ) public view returns (uint256) {
        return _ticketsContractToExperienceId[ticketsContract];
    }

    function getAllExperiences()
        public
        view
        returns (ExperienceData[] memory allExperiences)
    {
        allExperiences = new ExperienceData[](_totalExperiences);
        for (uint256 i; i < _totalExperiences; ) {
            allExperiences[i] = ExperienceData({
                experienceId: i + 1,
                ticketsContract: _experienceToTicketsContract[i + 1]
            });
            unchecked {
                ++i;
            }
        }
    }

    function registerUser(string memory metadataURI) public {
        IBonvoUserReputation(_userReputationContract).mintReputation(
            _msgSender(),
            metadataURI
        );
        _isUser[_msgSender()] = true;
    }

    function createExperience(
        string memory name,
        string memory symbol,
        string memory collectionMetadataURI,
        string memory mainAssetURI,
        uint256 price
    ) public onlyUser {
        _totalExperiences++;

        uint256 experienceId = _totalExperiences;
        address experienceTicketsAddress = IBonvoExperienceDeployerHelper(
            _deployerHelperContract
        ).createExperience(
                name,
                symbol,
                collectionMetadataURI,
                _msgSender(),
                price
            );

        _experienceToTicketsContract[experienceId] = experienceTicketsAddress;
        _ticketsContractToExperienceId[experienceTicketsAddress] = experienceId;

        // Add NFT in a collection of all experiences, this will be used to add badges to the experience.
        uint256 nftExperienceId = IBonvoExperience(_experiencesContract)
            .addExperience(
                _msgSender(),
                collectionMetadataURI,
                mainAssetURI,
                experienceTicketsAddress
            );

        if (nftExperienceId != experienceId) revert ExperienceIdMismatch();
        emit NewExperience(
            experienceId,
            _msgSender(),
            experienceTicketsAddress,
            name
        );
    }

    function _checkIsUser() private view {
        if (!_isUser[_msgSender()]) revert NotUser();
    }
}
