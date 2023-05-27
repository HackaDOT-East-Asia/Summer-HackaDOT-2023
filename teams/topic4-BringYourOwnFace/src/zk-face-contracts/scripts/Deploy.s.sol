// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../contracts/FaceKeyRecover.sol";

// https://book.getfoundry.sh/tutorials/solidity-scripting
// forge script script/Deploy.s.sol:Deploy --rpc-url $MOONBASE_RPC_URL --broadcast --verify -vvvv
contract Deploy is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        FaceKeyRecover nft = new FaceKeyRecover(64);

        vm.stopBroadcast();
    }
}

