// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

interface IBonvoExperienceDeployerHelper {
    function createExperience(
        string memory name,
        string memory symbol,
        string memory collectionMetadataURI,
        address experienceOwner,
        uint256 price
    ) external returns (address);
}
