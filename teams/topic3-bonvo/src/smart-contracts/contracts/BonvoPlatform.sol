// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/nestable/IERC6059.sol";
import "./interfaces/IBonvoBadge.sol";
import "./interfaces/IBonvoProperty.sol";
import "./interfaces/IBonvoUserReputation.sol";
import "./interfaces/IBonvoExperience.sol";
import "./interfaces/IBonvoExperienceDeployerHelper.sol";

error AlreadyListed();
error BadgeAlreadyGiven();
error DatesAreNotAvailable();
error ExperienceIdMismatch();
error InvalidDate();
error LastDateHasNotPassed();
error NotLandlord();
error NotListed();
error NotTenant();
error NotUser();

contract BonvoPlatform is Ownable {
    // EXPERIENCES EVENTS
    event NewExperience(
        uint256 indexed experienceId,
        address indexed owner,
        address indexed ticketsContract,
        string name
    );

    // RENTALS STRUCTS
    struct Listing {
        uint256 pricePerDay;
        uint256 deposit;
        address landlord;
    }

    struct ExtendedListing {
        uint256 propertyId;
        string propertyMetadataUri;
        uint256 pricePerDay;
        uint256 deposit;
        address landlord;
    }

    struct Booking {
        uint256 bookingId;
        uint256 propertyId;
        uint256[] dates;
        uint256 price;
        uint256 deposit;
        address tenant;
        address landlord;
    }

    struct FinishedBooking {
        bool landlordApproved;
        bool tenantApproved;
        bool badgeGivenToLandlord;
        bool badgeGivenToProperty;
        bool badgeGivenToTenant;
    }

    // EXPERIENCES STRUCTS
    struct ExperienceData {
        uint256 experienceId;
        address ticketsContract;
    }

    // GENERAL
    address private _bnvToken;
    address private _beneficiary;
    address private _userReputationContract;
    mapping(address => bool) private _isUser;

    // RENTALS VARIABLES
    address private _propertiesContract;
    address private _badgesContract;
    uint256 private _platformFeeBps;
    uint256 private _addPropertieFee;
    uint256 private _registerUserFee;
    uint256 private _totalBookings;

    mapping(uint256 => Listing) private _tokenIdToListing;
    mapping(uint256 => Booking) private _bookings;
    mapping(uint256 => FinishedBooking) private _finishedBookings;
    uint256[] private _listedProperties; // This is temporary, while we set up an indexer

    // There are no structures in solidity to store a day, so we use timestamp with 1 day precision
    mapping(uint256 => mapping(uint256 => bool))
        private _propertyToDayToIsBooked;

    // EXPERIENCES VARIABLES
    address private _experiencesCollectionContract;
    address private _deployerHelperContract;
    mapping(uint256 experienceId => address ticketsContract)
        private _experienceToTicketsContract;
    mapping(address ticketsContract => uint256 experienceId)
        private _ticketsContractToExperienceId;

    uint256 private _totalExperiences;


    modifier onlyUser() {
        _checkIsUser();
        _;
    }

    modifier onlyLandlord(uint256 propertyId) {
        _checkIsLandlord(propertyId);
        _;
    }

    modifier onlyLandlordOfBooking(uint256 bookingId) {
        _checkIsLandlordOfBooking(bookingId);
        _;
    }

    modifier onlyListed(uint256 propertyId) {
        _checkListed(propertyId);
        _;
    }

    modifier onlyNotListed(uint256 propertyId) {
        _checkNotListed(propertyId);
        _;
    }

    modifier onlyTenant(uint256 bookingId) {
        _checkIsTenant(bookingId);
        _;
    }

    modifier onlyFinishedBooking(uint256 bookingId) {
        _checkBookingFinished(bookingId);
        _;
    }

    constructor(
        address bnvToken,
        address propertiesContract,
        address userReputationContract,
        address badgesContract,
        uint256 addPropertieFee,
        uint256 registerUserFee,
        uint256 platformFeeBps,
        address beneficiary
    ) {
        _bnvToken = bnvToken;
        _propertiesContract = propertiesContract;
        _userReputationContract = userReputationContract;
        _badgesContract = badgesContract;
        _addPropertieFee = addPropertieFee;
        _registerUserFee = registerUserFee;
        _platformFeeBps = platformFeeBps;
        _beneficiary = beneficiary;
    }

    function setExperiencesContracts(
        address experiencesContract,
        address deployerHelperContract
    ) public onlyOwner {
        _experiencesCollectionContract = experiencesContract;
        _deployerHelperContract = deployerHelperContract;
    }

    // -------------------- GENERAL GETTERS ---------------------

    function getBnvToken() public view returns (address) {
        return _bnvToken;
    }

    function getUserReputationContract() public view returns (address) {
        return _userReputationContract;
    }

    function getBadgesContract() public view returns (address) {
        return _badgesContract;
    }

    function getRegisterUserFee() public view returns (uint256) {
        return _registerUserFee;
    }

    function getPlatformFeeBps() public view returns (uint256) {
        return _platformFeeBps;
    }

    function getBeneficiary() public view returns (address) {
        return _beneficiary;
    }

    function getIsUser(address user) public view returns (bool) {
        return _isUser[user];
    }

    // -------------------- RENTALS GETTERS ---------------------

    function getPropertiesContract() public view returns (address) {
        return _propertiesContract;
    }

    function getAddPropertieFee() public view returns (uint256) {
        return _addPropertieFee;
    }

    function getListing(
        uint256 propertyId
    ) public view returns (Listing memory) {
        return _tokenIdToListing[propertyId];
    }

    function getBookingsForTenant(
        address tenant
    ) public view returns (Booking[] memory tenantBookings) {
        uint256[] memory bookingIds = new uint256[](_totalBookings);
        uint256 matches;
        for (uint256 i; i < _totalBookings; ) {
            if (_bookings[i + 1].tenant == tenant) {
                bookingIds[matches] = i + 1;
                unchecked {
                    ++matches;
                }
            }
            unchecked {
                ++i;
            }
        }
        tenantBookings = new Booking[](matches);
        for (uint256 i; i < matches; ) {
            tenantBookings[i] = _bookings[bookingIds[i]];
            unchecked {
                ++i;
            }
        }
    }

    function getBookingsForLandlord(
        address landlord
    ) public view returns (Booking[] memory landlordBookings) {
        uint256[] memory bookingIds = new uint256[](_totalBookings);
        uint256 matches;
        for (uint256 i; i < _totalBookings; ) {
            if (_bookings[i + 1].landlord == landlord) {
                bookingIds[matches] = i + 1;
                unchecked {
                    ++matches;
                }
            }
            unchecked {
                ++i;
            }
        }
        landlordBookings = new Booking[](matches);
        for (uint256 i; i < matches; ) {
            landlordBookings[i] = _bookings[bookingIds[i]];
            unchecked {
                ++i;
            }
        }
    }

    function getAllListings() public view returns (ExtendedListing[] memory) {
        uint256 length = _listedProperties.length;
        ExtendedListing[] memory listings = new ExtendedListing[](length);
        Listing memory temp;
        for (uint256 i; i < length; ) {
            temp = _tokenIdToListing[_listedProperties[i]];
            listings[i] = ExtendedListing(
                _listedProperties[i],
                IBonvoProperty(_propertiesContract).tokenURI(
                    _listedProperties[i]
                ),
                temp.pricePerDay,
                temp.deposit,
                temp.landlord
            );
            unchecked {
                ++i;
            }
        }
        return listings;
    }

    function getBooking(
        uint256 bookingId
    ) public view returns (Booking memory) {
        return _bookings[bookingId];
    }

    function getAreDatesAvaliable(
        uint256 propertyId,
        uint256[] calldata dates
    ) public view onlyListed(propertyId) returns (bool) {
        uint256 length = dates.length;
        for (uint256 i; i < length; ) {
            if (_propertyToDayToIsBooked[propertyId][dates[i]]) {
                return false;
            }
            unchecked {
                ++i;
            }
        }
        return true;
    }

    function getTotalBookings() public view returns (uint256) {
        return _totalBookings;
    }


    // EXPERIENCE GETTERS
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

    // -----------------GENERAL SETTERS ---------------------

    function setBnvToken(address bnvToken_) public onlyOwner {
        _bnvToken = bnvToken_;
    }

    function setUserReputationContract(
        address userReputationContract_
    ) public onlyOwner {
        _userReputationContract = userReputationContract_;
    }

    function setBadgesContract(address badgesContract_) public onlyOwner {
        _badgesContract = badgesContract_;
    }

    function setRegisterUserFee(uint256 registerUserFee_) public onlyOwner {
        _registerUserFee = registerUserFee_;
    }

    function setPlatformFeeBps(uint256 platformFeeBps_) public onlyOwner {
        _platformFeeBps = platformFeeBps_;
    }

    function setBeneficiary(address beneficiary_) public onlyOwner {
        _beneficiary = beneficiary_;
    }

    // ----------------- RENTALS SETTERS ---------------------

    function setPropertiesContract(
        address propertiesContract_
    ) public onlyOwner {
        _propertiesContract = propertiesContract_;
    }

    function setAddPropertieFee(uint256 addPropertieFee_) public onlyOwner {
        _addPropertieFee = addPropertieFee_;
    }

    // ------------------ REGISTRATION -------------------

    function registerUser(string memory metadataURI) public {
        _charge(_msgSender(), _registerUserFee, _beneficiary);
        IBonvoUserReputation(_userReputationContract).mintReputation(
            _msgSender(),
            metadataURI
        );
        _isUser[_msgSender()] = true;
    }

    // ----------------- EXPERIENCE MANAGEMENT ---------------------

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
        uint256 nftExperienceId = IBonvoExperience(_experiencesCollectionContract)
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

    // ------------- PROPERTY MANAGEMENT --------------

    function addProperty(string memory metadataURI) public onlyUser {
        _charge(_msgSender(), _addPropertieFee, _beneficiary);
        IBonvoProperty(_propertiesContract).addProperty(
            _msgSender(),
            metadataURI
        );
    }

    // ------------------- LISTING --------------------

    function listProperty(
        uint256 propertyId,
        uint256 pricePerDay,
        uint256 deposit
    ) public onlyLandlord(propertyId) onlyNotListed(propertyId) {
        _tokenIdToListing[propertyId] = Listing(
            pricePerDay,
            deposit,
            _msgSender()
        );
        _listedProperties.push(propertyId);
    }

    // This is one way only, cannot undo since we use the same to track booked dates
    function makeDatesUnavailable(
        uint256 propertyId,
        uint256[] memory dates
    ) public onlyLandlord(propertyId) onlyListed(propertyId) {
        _makeDatesUnavailable(propertyId, dates);
    }

    function book(
        uint256 propertyId,
        uint256[] calldata dates
    ) public onlyUser onlyListed(propertyId) {
        if (!getAreDatesAvaliable(propertyId, dates)) {
            revert DatesAreNotAvailable();
        }

        Listing memory listing = _tokenIdToListing[propertyId];
        uint256 totalDates = dates.length;
        uint256 bookingPrice = totalDates * listing.pricePerDay;
        uint256 deposit = listing.deposit;
        _charge(_msgSender(), bookingPrice + deposit, address(this));

        _makeDatesUnavailable(propertyId, dates);
        unchecked {
            ++_totalBookings;
        }
        _bookings[_totalBookings] = Booking({
            bookingId: _totalBookings,
            propertyId: propertyId,
            dates: dates,
            price: bookingPrice,
            deposit: deposit,
            tenant: _msgSender(),
            landlord: listing.landlord
        });
    }

    function confirmRentalAsTenant(
        uint256 bookingId
    ) public onlyTenant(bookingId) onlyFinishedBooking(bookingId) {
        _finishedBookings[bookingId].tenantApproved = true;
        if (_finishedBookings[bookingId].landlordApproved) {
            _finishBooking(bookingId);
        }
    }

    function confirmRentalAsLandlord(
        uint256 bookingId
    ) public onlyLandlordOfBooking(bookingId) onlyFinishedBooking(bookingId) {
        _finishedBookings[bookingId].landlordApproved = true;
        if (_finishedBookings[bookingId].tenantApproved) {
            _finishBooking(bookingId);
        }
    }

    function isBookingFinished(uint256 bookingId) public view returns (bool) {
        return
            _finishedBookings[bookingId].tenantApproved &&
            _finishedBookings[bookingId].landlordApproved;
    }

    function finishBookingAsArbitrer(
        uint256 bookingId,
        bool inFavorOfTenant
    ) public onlyOwner onlyFinishedBooking(bookingId) {
        _finishedBookings[bookingId] = FinishedBooking(
            true,
            true,
            true,
            true,
            true
        );

        Booking memory booking = _bookings[bookingId];

        if (inFavorOfTenant) {
            IERC20(_bnvToken).transfer(
                booking.tenant,
                booking.price + booking.deposit
            );
        } else {
            _finishBooking(bookingId);
        }
    }

    function _finishBooking(uint256 bookingId) private {
        Booking memory booking = _bookings[bookingId];
        uint256 platformFee = (booking.price * _platformFeeBps) / 10000;
        uint256 landlordShare = booking.price - platformFee;
        IERC20(_bnvToken).transfer(_beneficiary, platformFee);
        IERC20(_bnvToken).transfer(booking.landlord, landlordShare);
        IERC20(_bnvToken).transfer(booking.tenant, booking.deposit);
    }

    // ------------------- BADGES --------------------

    function giveBadgeToLandlord(
        uint256 bookingId,
        IBonvoBadge.BadgeType badgeType
    ) public onlyTenant(bookingId) onlyFinishedBooking(bookingId) {
        if (_finishedBookings[bookingId].badgeGivenToLandlord) {
            revert BadgeAlreadyGiven();
        }
        _finishedBookings[bookingId].badgeGivenToLandlord = true;

        uint256 reputationTokenID = IBonvoUserReputation(
            _userReputationContract
        ).getTokenIdForAddress(_bookings[bookingId].landlord);
        IBonvoBadge(_badgesContract).mintBadge(
            _userReputationContract,
            reputationTokenID,
            badgeType
        );
    }

    function giveBadgeToProperty(
        uint256 bookingId,
        IBonvoBadge.BadgeType badgeType
    ) public onlyTenant(bookingId) onlyFinishedBooking(bookingId) {
        if (_finishedBookings[bookingId].badgeGivenToProperty) {
            revert BadgeAlreadyGiven();
        }

        _finishedBookings[bookingId].badgeGivenToProperty = true;

        IBonvoBadge(_badgesContract).mintBadge(
            _propertiesContract,
            _bookings[bookingId].propertyId,
            badgeType
        );
    }

    function giveBadgeToTenant(
        uint256 bookingId,
        IBonvoBadge.BadgeType badgeType
    ) public onlyLandlordOfBooking(bookingId) onlyFinishedBooking(bookingId) {
        if (_finishedBookings[bookingId].badgeGivenToTenant) {
            revert BadgeAlreadyGiven();
        }

        _finishedBookings[bookingId].badgeGivenToTenant = true;

        uint256 reputationTokenID = IBonvoUserReputation(
            _userReputationContract
        ).getTokenIdForAddress(_bookings[bookingId].tenant);
        IBonvoBadge(_badgesContract).mintBadge(
            _userReputationContract,
            reputationTokenID,
            badgeType
        );
    }

    // ----------------- UTILITIES ------------------

    function _makeDatesUnavailable(
        uint256 propertyId,
        uint256[] memory dates
    ) internal {
        uint256 length = dates.length;
        for (uint256 i; i < length; ) {
            _validateDate(dates[i]);
            _propertyToDayToIsBooked[propertyId][dates[i]] = true;
            unchecked {
                ++i;
            }
        }
    }

    function _validateDate(uint256 date) internal pure {
        if (date % 86400 != 0) {
            revert InvalidDate();
        }
    }

    function _charge(address user, uint256 fee, address receiver) private {
        IERC20(_bnvToken).transferFrom(user, receiver, fee);
    }

    function _getLandlord(uint256 propertyId) private view returns (address) {
        return IERC6059(_propertiesContract).ownerOf(propertyId);
    }

    // --------------- MODIFIER CHECKS ----------------

    function _checkIsUser() private view {
        if (!_isUser[_msgSender()]) revert NotUser();
    }

    function _checkIsLandlord(uint256 propertyId) private view {
        if (_getLandlord(propertyId) != _msgSender()) revert NotLandlord();
    }

    function _checkIsLandlordOfBooking(uint256 bookingId) private view {
        if (_bookings[bookingId].landlord != _msgSender()) revert NotLandlord();
    }

    function _checkListed(uint256 propertyId) private view {
        if (_tokenIdToListing[propertyId].pricePerDay == 0) revert NotListed();
    }

    function _checkNotListed(uint256 propertyId) private view {
        if (_tokenIdToListing[propertyId].pricePerDay != 0)
            revert AlreadyListed();
    }

    function _checkIsTenant(uint256 bookingId) private view {
        if (_bookings[bookingId].tenant != _msgSender()) revert NotTenant();
    }

    function _checkBookingFinished(uint256 bookingId) private view {
        Booking memory booking = _bookings[bookingId];
        uint256 lastDate = booking.dates[booking.dates.length - 1];
        if (block.timestamp < lastDate) {
            revert LastDateHasNotPassed();
        }
    }
}
