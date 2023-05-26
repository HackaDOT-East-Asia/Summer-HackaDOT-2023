// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@rmrk-team/evm-contracts/contracts/implementations/nativeTokenPay/RMRKEquippableImpl.sol";
import "./interfaces/IBonvoUserReputation.sol";
import "./interfaces/IBonvoExperience.sol";
import "./interfaces/IBonvoExperienceDeployerHelper.sol";
import "./BonvoExperienceTicket.sol";
import "./BonvoExperience.sol";
import "./access/PlatformGated.sol";

error ExperienceIdMismatch();
error NotUser();

contract BonvoExperienceDeployerHelper is
    PlatformGated,
    IBonvoExperienceDeployerHelper
{
    constructor(address platform) PlatformGated(platform) {}

    function createExperience(
        string memory name,
        string memory symbol,
        string memory collectionMetadataURI,
        address experienceOwner,
        uint256 price
    ) public onlyPlatform returns (address) {
        // Deploy a new contract to manage tickets for this experience
        BonvoExperienceTicket experienceTickets = new BonvoExperienceTicket(
            name,
            symbol,
            collectionMetadataURI,
            price,
            address(this)
        );
        // Transfer ownership to experience creator
        experienceTickets.transferOwnership(experienceOwner);
        return address(experienceTickets);
    }
}
