// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

interface IBonvoUserReputation {
    function getTokenIdForAddress(
        address owner
    ) external view returns (uint256 tokenId);

    function mintReputation(
        address owner,
        string memory metadataURI
    ) external returns (uint256);
}
