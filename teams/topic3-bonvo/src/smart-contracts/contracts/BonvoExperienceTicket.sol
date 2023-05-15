// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "./access/PlatformGated.sol";
import "./interfaces/IBonvoExperienceTicket.sol";

contract BonvoExperienceTicket is IBonvoExperienceTicket, Ownable, RMRKCollectionMetadata, PlatformGated, RMRKEquippable {
    uint256 private _totalAssets;
    uint256 private _totalSupply;
    uint256 private immutable _maxSupply;
    mapping(uint256 => string) private _tokenUri;
    address private _badges;

    constructor(
        uint256 maxSupply_,
        string memory collectionMetadata_,
        address platform
    )
        PlatformGated(platform)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKEquippable("Bonvo Experience", "BEXP")
    {
        _maxSupply = 2 ** 256 - 1;
    }

}
