// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

interface IBonvoExperience {
    function addExperience(
        address owner,
        string memory metadataURI
    ) external returns (uint256);

    function tokenURI(uint256 tokenId) external view returns (string memory);
}
