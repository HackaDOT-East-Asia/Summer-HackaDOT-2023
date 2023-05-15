// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestableMultiAsset.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKTokenURI.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/soulbound/RMRKSoulbound.sol";
import "./access/PlatformGated.sol";
import "./interfaces/IBonvoUserReputation.sol";
import "./interfaces/IBonvoBadge.sol";

error AddressAlreadyHasReputationNFT(uint256 currentTokenId);
error AddressDoesNotHaveReputationNFT();

contract BonvoUserReputation is
    IBonvoUserReputation,
    Ownable,
    PlatformGated,
    RMRKCollectionMetadata,
    RMRKSoulbound,
    RMRKNestableMultiAsset
{
    uint256 private _totalAssets;
    uint256 private _totalSupply;
    uint256 private immutable _maxSupply;
    mapping(address => uint256) private _tokenIdPerAddress;
    mapping(uint256 => string) _tokenUri;
    address private _badges;

    constructor(
        uint256 maxSupply_,
        string memory collectionMetadata_,
        address platform,
        address badges
    )
        PlatformGated(platform)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKNestableMultiAsset("BonvoProperty", "BP")
    {
        _maxSupply = maxSupply_;
        _badges = badges;
    }

    // -------------------- SOULBOUND ---------------------

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(RMRKSoulbound, RMRKNestableMultiAsset)
        returns (bool)
    {
        return
            RMRKSoulbound.supportsInterface(interfaceId) ||
            super.supportsInterface(interfaceId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(RMRKCore, RMRKSoulbound) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // -------------------- GETTERS ---------------------

    function totalAssets() public view returns (uint256) {
        return _totalAssets;
    }

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function maxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function getBadges() public view returns (address) {
        return _badges;
    }

    function getTokenIdForAddress(
        address owner
    ) public view returns (uint256 tokenId) {
        tokenId = _tokenIdPerAddress[owner];
        if (tokenId == 0) revert AddressDoesNotHaveReputationNFT();
    }

    function getMedals(
        uint256 tokenId
    )
        public
        view
        virtual
        returns (
            uint256 friendlyMedalCount,
            uint256 punctualMedalCount,
            uint256 cleanMedalCount,
            uint256 comfyBedMedalCount,
            uint256 goodLocationMedalCount
        )
    {
        _requireMinted(tokenId);
        Child[] memory children = _activeChildren[tokenId];
        uint256 length = children.length;
        // There might be less than the children length, so we need to create a temp array
        uint256[] memory tempBadgeIds = new uint256[](length);
        uint256 badgesIndex;
        for (uint256 i = 0; i < length; ) {
            if (children[i].contractAddress == _badges) {
                tempBadgeIds[badgesIndex] = children[i].tokenId;
                unchecked {
                    ++badgesIndex;
                }
            }
            unchecked {
                ++i;
            }
        }
        uint256[] memory badgeIds = new uint256[](badgesIndex);
        assembly {
            badgeIds := tempBadgeIds
        }

        (
            friendlyMedalCount,
            punctualMedalCount,
            cleanMedalCount,
            comfyBedMedalCount,
            goodLocationMedalCount
        ) = IBonvoBadge(_badges).countGroupByType(badgeIds);
    }

    // --------------- SETTERS AND MINT ----------------

    function setPlatform(address platform) public override onlyOwner {
        _setPlatform(platform);
    }

    function setBadges(address badges) public onlyOwner {
        _badges = badges;
    }

    function mintReputation(
        address owner,
        string memory metadataURI
    ) public onlyPlatform returns (uint256) {
        if (_tokenIdPerAddress[owner] != 0)
            revert AddressAlreadyHasReputationNFT(_tokenIdPerAddress[owner]);

        unchecked {
            ++_totalSupply;
        }
        uint256 tokenId = _totalSupply;

        _tokenIdPerAddress[owner] = tokenId;
        _tokenUri[tokenId] = metadataURI;
        _mint(owner, tokenId, "");
        return tokenId;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        _requireMinted(tokenId);
        return _tokenUri[tokenId];
    }

    function _afterAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId,
        bytes memory
    ) internal override {
        // Auto accept children if they are badges
        if (childAddress == _badges) {
            _acceptChild(
                tokenId,
                _pendingChildren[tokenId].length - 1,
                childAddress,
                childId
            );
        }
    }
}
