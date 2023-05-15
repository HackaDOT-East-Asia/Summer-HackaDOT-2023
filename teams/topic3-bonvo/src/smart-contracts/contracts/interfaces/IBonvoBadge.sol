// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

interface IBonvoBadge {
    enum BadgeType {
        None,
        Friendly,
        Punctual,
        Clean,
        ComfyBed,
        GoodLocation
    }

    function mintBadge(
        address to,
        uint256 destinationId,
        BadgeType badgeType
    ) external;

    function countGroupByType(
        uint256[] memory tokenIds
    )
        external
        view
        returns (
            uint256 friendlyCount,
            uint256 punctualCount,
            uint256 cleanCount,
            uint256 comfyBedCount,
            uint256 goodLocationCount
        );
}
