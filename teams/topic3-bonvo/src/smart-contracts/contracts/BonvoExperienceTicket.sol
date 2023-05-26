// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "./access/PlatformGated.sol";
import "./interfaces/IBonvoExperienceTicket.sol";

error CannotBuyZeroTokens();
error MaxTicketsForContractSold();
error NotEnoughtTickets();
error TicketAlreadyUsed();
error WrongDate();

contract BonvoExperienceTicket is
    IBonvoExperienceTicket,
    Ownable,
    RMRKCollectionMetadata,
    PlatformGated,
    RMRKEquippable
{
    struct TicketWithData {
        uint256 ticketId;
        uint256 date;
        string memo;
        bool used;
    }

    uint256 private _totalAssets;
    uint256 internal _nextId;
    uint256 internal _totalSupply;
    uint256 internal _maxSupply;
    mapping(uint256 => string) private _tokenUri;
    address private _badges;
    uint256 private _price;
    mapping(uint256 date => uint256 quantity) private _totalTicketsPerDate;
    mapping(uint256 date => uint256 quantity) private _boughtTicketsPerDate;
    mapping(uint256 ticketId => string memo) private _tokenMemos;
    mapping(uint256 ticketId => uint256 date) private _datePerTicket;
    // Tickets per user
    mapping(address => uint256[]) private _ticketsIdsPerUser; // This should be managed by an indexer later
    mapping(address => uint256) private _activeTicketsPerUser;

    constructor(
        string memory name,
        string memory symbol,
        string memory collectionMetadataURI,
        uint256 price,
        address platform
    )
        PlatformGated(platform)
        RMRKCollectionMetadata(collectionMetadataURI)
        RMRKEquippable(name, symbol)
    {
        _maxSupply = 2 ** 256 - 1;
        _price = price;
    }

    function openTicketsForDates(
        uint256 quantity,
        uint256[] memory dates
    ) public onlyOwnerOrContributor {
        uint256 length = dates.length;
        for (uint256 i; i < length; ) {
            _totalTicketsPerDate[dates[i]] += quantity;
            _totalTicketsPerDate[dates[i]] += quantity;
            unchecked {
                ++i;
            }
        }
    }

    function buyTickets(address to, uint256 quantity, uint256 date) public {
        if (
            _boughtTicketsPerDate[date] + quantity > _totalTicketsPerDate[date]
        ) {
            revert NotEnoughtTickets();
        }
        if (quantity == uint256(0)) revert CannotBuyZeroTokens();
        if (quantity + _nextId > _maxSupply) revert MaxTicketsForContractSold();

        _boughtTicketsPerDate[date] += quantity;

        uint256 nextToken = _nextId + 1;
        unchecked {
            _nextId += quantity;
            _totalSupply += quantity;
            _activeTicketsPerUser[to] += quantity;
        }
        uint256 totalSupplyOffset = _nextId + 1;

        for (uint256 i = nextToken; i < totalSupplyOffset; ) {
            _safeMint(to, i, "");
            _ticketsIdsPerUser[to].push(i);
            unchecked {
                ++i;
            }
        }
    }

    function useTicket(
        uint256 ticketId,
        uint256 date,
        string memory memo
    ) public onlyApprovedOrOwner(ticketId) {
        if (bytes(_tokenMemos[ticketId]).length != 0) {
            revert TicketAlreadyUsed();
        }
        if (_datePerTicket[ticketId] != date) {
            revert WrongDate();
        }
        _tokenMemos[ticketId] = memo;
        _activeTicketsPerUser[ownerOf(ticketId)] -= 1;
    }

    function getTicketMemo(
        uint256 ticketId
    ) public view returns (string memory) {
        return _tokenMemos[ticketId];
    }

    function giveBadgeToExperience(
        uint256 tokenId,
        IBonvoBadge.BadgeType badgeId
    ) public {
        // TODO: pending implementation
    }

    function getAvailableTicketsForDate(
        uint256 date
    ) public view returns (uint256) {
        return _totalTicketsPerDate[date] - _boughtTicketsPerDate[date];
    }

    function getDatePerTicket(uint256 ticketId) public view returns (uint256) {
        return _datePerTicket[ticketId];
    }

    function getTicketsPerUser(
        address user
    ) public view returns (uint256[] memory) {
        return _ticketsIdsPerUser[user];
    }

    function getActiveTicketsPerUser(
        address user
    ) public view returns (uint256) {
        return _activeTicketsPerUser[user];
    }

    function getTicketsWithDataPerUser(
        address user,
        bool onlyActive
    ) public view returns (TicketWithData[] memory) {
        TicketWithData[] memory availableTickets;
        uint256 totalTickets = _ticketsIdsPerUser[user].length;
        if (onlyActive)
            availableTickets = new TicketWithData[](
                _activeTicketsPerUser[user]
            );
        else availableTickets = new TicketWithData[](totalTickets);
        uint256 index;
        for (uint256 i; i < totalTickets; ) {
            if (
                !onlyActive ||
                bytes(_tokenMemos[_ticketsIdsPerUser[user][i]]).length == 0
            ) {
                availableTickets[index] = TicketWithData({
                    ticketId: _ticketsIdsPerUser[user][i],
                    date: _datePerTicket[_ticketsIdsPerUser[user][i]],
                    memo: _tokenMemos[_ticketsIdsPerUser[user][i]],
                    used: bytes(_tokenMemos[_ticketsIdsPerUser[user][i]])
                        .length != 0
                });
                unchecked {
                    ++index;
                }
            }
            unchecked {
                ++i;
            }
        }
        return availableTickets;
    }
}
