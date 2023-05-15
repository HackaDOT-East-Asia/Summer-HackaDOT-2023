// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestableMultiAsset.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/extension/soulbound/RMRKSoulbound.sol";
import "./access/PlatformGated.sol";
import "./interfaces/IBonvoBadge.sol";

error AddressAlreadyHasReputationNFT(uint256 currentTokenId);
error AddressDoesNotHaveReputationNFT();

contract BonvoBadge is
    IBonvoBadge,
    Ownable,
    PlatformGated,
    RMRKCollectionMetadata,
    RMRKSoulbound,
    RMRKNestableMultiAsset
{
    uint256 private _totalAssets;
    uint256 private _totalSupply;
    uint256 private immutable _maxSupply;
    string private _baseTokenUri;
    mapping(address => uint256) private _tokenIdPerAddress;
    mapping(uint256 => string) private _tokenUri;
    mapping(uint256 => BadgeType) private _badgeTypes;

    constructor(
        uint256 maxSupply_,
        string memory collectionMetadata_,
        string memory baseTokenUri,
        address platform
    )
        PlatformGated(platform)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKNestableMultiAsset("BonvoProperty", "BP")
    {
        _maxSupply = maxSupply_;
        _baseTokenUri = baseTokenUri;
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

    function getBaseTokenURI() public view returns (string memory) {
        return _baseTokenUri;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        return string.concat(_baseTokenUri, _tokenUri[tokenId]);
    }

    function getTokenIdForAddress(
        address owner
    ) public view returns (uint256 tokenId) {
        tokenId = _tokenIdPerAddress[owner];
        if (tokenId == 0) revert AddressDoesNotHaveReputationNFT();
    }

    // --------------- ASSETS MANAGEMENT ----------------

    function addAssetEntry(
        string memory metadataURI
    ) public virtual onlyOwnerOrContributor returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        _addAssetEntry(uint64(_totalAssets), metadataURI);
        return _totalAssets;
    }

    function addAssetToToken(
        uint256 tokenId,
        uint64 assetId,
        uint64 replacesAssetWithId
    ) public virtual onlyOwnerOrContributor {
        _addAssetToToken(tokenId, assetId, replacesAssetWithId);
    }

    // --------------- SETTERS AND MINT ----------------

    function setPlatform(address platform) public override onlyOwner {
        _setPlatform(platform);
    }

    function setBaseTokenURI(
        string memory baseTokenUri
    ) public virtual onlyOwner {
        _baseTokenUri = baseTokenUri;
    }

    function mintBadge(
        address to,
        uint256 destinationId,
        BadgeType badgeType
    ) public virtual onlyPlatform {
        if (_totalSupply + 1 > _maxSupply) revert RMRKMintOverMax();
        unchecked {
            _totalSupply += 1;
        }
        // _totalSupply is the tokenId
        _nestMint(to, _totalSupply, destinationId, "");
        _badgeTypes[_totalSupply] = badgeType;
        _tokenUri[_totalSupply] = _getPostUriAccordingToType(badgeType);
    }

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
        )
    {
        uint256 length = tokenIds.length;
        for (uint256 i = 0; i < length; i++) {
            uint256 tokenId = tokenIds[i];
            BadgeType badgeType = _badgeTypes[tokenId];
            if (badgeType == BadgeType.Friendly) {
                friendlyCount += 1;
            } else if (badgeType == BadgeType.Punctual) {
                punctualCount += 1;
            } else if (badgeType == BadgeType.ComfyBed) {
                comfyBedCount += 1;
            } else if (badgeType == BadgeType.Clean) {
                cleanCount += 1;
            } else if (badgeType == BadgeType.GoodLocation) {
                goodLocationCount += 1;
            }
        }
    }

    function _getPostUriAccordingToType(
        BadgeType badgeType
    ) private pure returns (string memory uri) {
        if (badgeType == BadgeType.Friendly) {
            uri = "friendly";
        } else if (badgeType == BadgeType.Punctual) {
            uri = "punctual";
        } else if (badgeType == BadgeType.ComfyBed) {
            uri = "comfy-bed";
        } else if (badgeType == BadgeType.Clean) {
            uri = "clean";
        } else if (badgeType == BadgeType.GoodLocation) {
            uri = "good-location";
        }
    }
}
