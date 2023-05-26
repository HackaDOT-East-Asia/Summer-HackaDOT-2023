// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

import "./IBonvoBadge.sol";

interface IBonvoExperienceTicket {
    function openTicketsForDates(
        uint256 quantity,
        uint256[] memory dates
    ) external;

    function buyTickets(address to, uint256 quantity, uint256 date) external;

    function useTicket(
        uint256 ticketId,
        uint256 date,
        string memory memo
    ) external;

    function getTicketMemo(
        uint256 ticketId
    ) external view returns (string memory);

    function giveBadgeToExperience(
        uint256 tokenId,
        IBonvoBadge.BadgeType badgeId
    ) external;
}
