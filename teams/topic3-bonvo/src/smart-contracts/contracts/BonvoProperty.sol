// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.16;

import "@rmrk-team/evm-contracts/contracts/RMRK/nestable/RMRKNestableMultiAsset.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "./access/PlatformGated.sol";
import "./interfaces/IBonvoProperty.sol";
import "./interfaces/IBonvoBadge.sol";

contract BonvoProperty is
    IBonvoProperty,
    Ownable,
    PlatformGated,
    RMRKCollectionMetadata,
    RMRKNestableMultiAsset
{
    uint256 private _totalAssets;
    uint256 private _totalSupply;
    uint256 private immutable _maxSupply;
    mapping(uint256 => string) private _tokenUri;
    address private _badges;

    constructor(
        uint256 maxSupply_,
        string memory collectionMetadata_,
        address platform,
        address badges
    )
        PlatformGated(platform)
        RMRKCollectionMetadata(collectionMetadata_)
        RMRKNestableMultiAsset("BonvoProperty", "BP")
    {
        _maxSupply = maxSupply_;
        _badges = badges;
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

    function getBadges() public view returns (address) {
        return _badges;
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual returns (string memory) {
        _requireMinted(tokenId);
        return _tokenUri[tokenId];
    }

    function setPlatform(address platform) public override onlyOwner {
        _setPlatform(platform);
    }

    function setBadges(address badges) public onlyOwner {
        _badges = badges;
    }

    // --------------- PROPERTY MANAGEMENT ----------------

    function addProperty(
        address owner,
        string memory metadataURI
    ) public onlyPlatform returns (uint256) {
        unchecked {
            ++_totalSupply;
        }
        uint256 tokenId = _totalSupply;
        _mint(owner, tokenId, "");
        _tokenUri[tokenId] = metadataURI;
        return tokenId;
    }

    function addImagesToProperty(
        uint256 tokenId,
        string[] memory metadataURIs
    ) public virtual onlyApprovedOrOwner(tokenId) returns (uint256) {
        uint256 length = metadataURIs.length;
        for (uint256 i = 0; i < length; ) {
            unchecked {
                ++_totalAssets;
            }
            uint64 assetId = uint64(_totalAssets);

            _addAssetEntry(assetId, metadataURIs[i]);
            _addAssetToToken(tokenId, assetId, 0);
            _acceptAsset(tokenId, 0, assetId);
            unchecked {
                ++i;
            }
        }
        return _totalAssets;
    }

    function replaceImageOnProperty(
        uint256 tokenId,
        uint64 oldAssetId,
        string memory newMetadataURI
    ) public virtual onlyApprovedOrOwner(tokenId) returns (uint256) {
        unchecked {
            _totalAssets += 1;
        }
        uint64 assetId = uint64(_totalAssets);
        _addAssetEntry(assetId, newMetadataURI);
        _addAssetToToken(tokenId, assetId, oldAssetId);
        _acceptAsset(tokenId, 0, assetId);
        return _totalAssets;
    }

    function getAllInfo(
        uint256 tokenId
    )
        public
        view
        virtual
        returns (
            string memory metadataURI,
            string[] memory assets,
            uint256 friendlyMedalCount,
            uint256 punctualMedalCount,
            uint256 cleanMedalCount,
            uint256 comfyBedMedalCount,
            uint256 goodLocationMedalCount
        )
    {
        _requireMinted(tokenId);
        metadataURI = _tokenUri[tokenId];

        // Get assets (images)
        uint64[] memory assetIds = _activeAssets[tokenId];
        uint256 length = assetIds.length;
        assets = new string[](assetIds.length);
        for (uint256 i = 0; i < length; ) {
            assets[i] = getAssetMetadata(tokenId, assetIds[i]);
            unchecked {
                ++i;
            }
        }

        // Get medals
        Child[] memory children = _activeChildren[tokenId];
        length = children.length;
        // There might be less than the children length, so we need to create a temp array
        uint256[] memory tempBadgeIds = new uint256[](length);
        uint256 badgesIndex;
        for (uint256 i = 0; i < length; ) {
            if (children[i].contractAddress == _badges) {
                tempBadgeIds[badgesIndex] = children[i].tokenId;
                unchecked {
                    ++badgesIndex;
                }
            }
            unchecked {
                ++i;
            }
        }
        uint256[] memory badgeIds = new uint256[](badgesIndex);
        assembly {
            badgeIds := tempBadgeIds
        }

        (
            friendlyMedalCount,
            punctualMedalCount,
            cleanMedalCount,
            comfyBedMedalCount,
            goodLocationMedalCount
        ) = IBonvoBadge(_badges).countGroupByType(badgeIds);
    }

    function _afterAddChild(
        uint256 tokenId,
        address childAddress,
        uint256 childId,
        bytes memory
    ) internal override {
        // Auto accept children if they are badges
        if (childAddress == _badges) {
            _acceptChild(
                tokenId,
                _pendingChildren[tokenId].length - 1,
                childAddress,
                childId
            );
        }
    }
}
