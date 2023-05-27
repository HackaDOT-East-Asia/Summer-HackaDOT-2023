// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4;

import {VerifierWrapper} from "./VerifierWrapper.sol";

// import "./ENS.sol";

contract FaceKeyRecover is VerifierWrapper {
    // using ENSNamehash for bytes;
    struct FaceData {
        address owner;
        bytes32 featureHash;
        bytes32 commitmentHash;
        bytes commitment;
    }

    mapping(address => bool) public isRegistered;
    mapping(address => FaceData) public FaceDataOfWallet;
    mapping(bytes32 => bool) public usedMessageHashes;

    // ENS ens;

    constructor(uint _maxMsgSize) VerifierWrapper(_maxMsgSize) {
        // ens = ENS(_ens);
    }

    function getOwner() public view returns (address) {
        require(isRegistered[msg.sender], "not registered");
        return FaceDataOfWallet[msg.sender].owner;
    }

    function register(
        address walletAddr,
        bytes32 featureHash,
        bytes32 commitmentHash,
        bytes calldata commitment
    ) public {
        require(!isRegistered[walletAddr], "already registered");
        FaceDataOfWallet[walletAddr] = FaceData(
            msg.sender,
            featureHash,
            commitmentHash,
            commitment
        );
        isRegistered[walletAddr] = true;
    }

    function recover(
        address walletAddr,
        bytes32 messageHash,
        bytes calldata proof
    ) public {
        require(isRegistered[walletAddr], "The wallet is not registered");
        require(!usedMessageHashes[messageHash], "Message hash already used");
        FaceData memory FaceData = FaceDataOfWallet[walletAddr];
        address oldOwner = FaceData.owner;
        address newOwner = msg.sender;
        // require(oldOwner == resolveENS(oldENS), "Invalid old ENS");
        bytes memory message = abi.encodePacked(oldOwner, newOwner);
        require(
            VerifierWrapper.verify(
                FaceData.commitmentHash,
                FaceData.featureHash,
                messageHash,
                message,
                proof
            ),
            "invalid proof"
        );
        usedMessageHashes[messageHash] = true;
        // address newOwner = resolveENS(newENS);
        // address newOwner = msg.sender;
        FaceDataOfWallet[walletAddr].owner = newOwner;
    }

    function refreshFaceData(
        address walletAddr,
        bytes32 featureHash,
        bytes32 commitmentHash,
        bytes calldata commitment
    ) public {
        require(isRegistered[walletAddr], "The wallet is not registered");
        FaceData memory FaceData = FaceDataOfWallet[walletAddr];
        require(
            msg.sender == FaceData.owner,
            "The owner can call the refresh"
        );
        FaceDataOfWallet[walletAddr].featureHash = featureHash;
        FaceDataOfWallet[walletAddr].commitmentHash = commitmentHash;
        FaceDataOfWallet[walletAddr].commitment = commitment;
    }

    function getMessageOfRecover(
        address walletAddr
    ) public view returns (bytes memory) {
        require(isRegistered[walletAddr], "The wallet is not registered");
        FaceData memory FaceData = FaceDataOfWallet[walletAddr];
        address oldOwner = FaceData.owner;
        address newOwner = msg.sender;
        bytes memory message = abi.encodePacked(oldOwner, newOwner);
        return message;
    }
}