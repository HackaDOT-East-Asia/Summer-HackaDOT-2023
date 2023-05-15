// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.18;

import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/access/Ownable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/utils/RMRKCollectionMetadata.sol";
import "./access/PlatformGated.sol";
import "./interfaces/IBonvoExperience.sol";

contract BonvoExperience is IBonvoExperience, Ownable, RMRKCollectionMetadata, PlatformGated, RMRKEquippable {
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
        RMRKEquippable("Bonvo Experience", "BEXP")
    {
        _maxSupply = maxSupply_;
        _badges = badges;
    }

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
    
    function addExperience(
        address owner,
        string memory metadataURI
    ) external onlyPlatform returns (uint256) {
        unchecked {
            ++_totalSupply;
        }
        uint256 tokenId = _totalSupply;
        _mint(owner, tokenId, "");
        _tokenUri[tokenId] = metadataURI;
        return tokenId;
    }

    function addImagesToExperience(
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
