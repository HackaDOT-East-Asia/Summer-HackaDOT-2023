// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../contracts/FaceKeyRecover.sol";
import "forge-std/console.sol";
import "../contracts/HelloWorld.sol";
import {CallLib} from"hyperlane/Call.sol";
import "hyperlane/TypeCasts.sol";
import "../contracts/interfaces/IInterchainAccountRouter.sol";
import "../contracts/interfaces/IInterchainGasPaymaster.sol";

// https://book.getfoundry.sh/tutorials/solidity-scripting
// forge script script/Deploy.s.sol:Deploy --rpc-url $MOONBASE_RPC_URL --broadcast --verify -vvvv
// {
//   "commitment": "0x43bd1b418a98581fd8e6bb27e7a6a1a78713f548c18108265d1ce2b327862ffda83598b12e4ff6f90c2d90a193f0775494ea31d4855a3d414dd90c74701ace0952157aada5265d5d97ae1e8cd9a3670ab32d7c08cd722fb26faa85d453a938b3cc3789930c85eb5880a04c04a4a88a5b497925f1b9485adf95f7a7eaf8ca773a85c2298c28d32f6d00000000",
//   "commitment_hash": "0x15098279eb45701737a525059e145ed94f3c69ae7c57aa23b15ef56c278bc347",
//   "message": "0x9a8f43",
//   "feature_hash": "0x0fd1096e4e5bacf7894236705a02925c09454b86b8ab0c4db70421bb985b8113",
//   "message_hash": "0x2331721deaf139d9f70dc1d07f0400e33e5d996ec76607ebf8616b6131049408"
// }

// {
//   "features": "0xddeb377dc4515c05a074b583e42403675d9b785d7502a064ebf1d093474b23ce000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//   "errors": "0x0000000000000000080000000000000000000010000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
//   "commitment": "0x43bd1b418a98581fd8e6bb27e7a6a1a78713f548c18108265d1ce2b327862ffda83598b12e4ff6f90c2d90a193f0775494ea31d4855a3d414dd90c74701ace0952157aada5265d5d97ae1e8cd9a3670ab32d7c08cd722fb26faa85d453a938b3cc3789930c85eb5880a04c04a4a88a5b497925f1b9485adf95f7a7eaf8ca773a85c2298c28d32f6d00000000",
//   "message": "0x9a8f43"
// }

// forge script script/RunLocal.s.sol:RunLocal --rpc-url $MOONBASE_RPC_URL --broadcast --verify -vvvv
contract RunLocal is Script {
    // address constant DeployedFaceKeyRecover = 0x3e3a5e3a57528a9c037b19D168189aD030e374a4;

    // params for registeration
    bytes32 constant featureHash = hex"2e979115027c73c78696d80c384e230b1317f84fca89034267579c1eb9d46db0";
    bytes32 constant commitmentHash = hex"0129f34e10ec07abdc499f18205e05a931ae6d3d0583a15272ad514f2a7523fe";
    bytes constant commitment = hex"b577b007bd3c08abfb74aa19c01395a00788c7862913953def64406050c7322ab5a393558c081b143a325c1de06856846f80704900df75be381216f53d7f6651d2557dae5c029b3cc0fbb671f53e11a1745466b4b1d4f39cf52c9e389bfe58796013ee4031816e839041cde2dc8d212ddf488834de1de7164e7f87b0e5ac1af210374da374ca572751247a8a";

    // params for recover
    bytes32 constant messageHash = hex"01256258a58b041e2277ff9b654ca23be60c30d391aed1af324f46cb60e92d61";
    bytes constant proof = hex"262f5514f250fbae63c592dcf462218598600e9a422a60e7fbecfbf354929b5805c2bd8c37484996128c6099ad5a3b7aee240b1564f6349b3fa7aeabe0b9fe091ee449d29b7b116c08420b3f905c52dad79efc4dd49152aeeca7f4363fba814c075fdf7f443345060644bb885ff423d35d227a4c20f8b163ffb6a54804cddb8c1c8318251fc5cd1e82ec2f602ec76924cd5647ecabe7f3fdd031973dede8ab640074467a3eeb8b7a841d35276cb23582d9e8bfa54d7116ad0d864a0fa38cfabf065ca46179934e56bc1b0e4976ac093dae32519613609f6fbb4340569ad3be3f2fc3816e092fff487d7013b141b38dc1ffaaa327ddad0800f94432fa86f71d5101aaedfbd7cc917f023659ba8ce6de60cbbfadf55ab1a7cd6d85e1cb0031e5ef12867ebd0fd57a4d7a9eed341de28adeee025d2533bd4a3a0bcda9351c0bf23320532471b24c5df3f5e750283223106e9bd95b03aaad567647b1d6398a84a8572aed73db2a1b2d6529e697aa39a923a7bcc9c62209a431458013367899a917d826094ade799a1c60238b371d3b42a4fab9b79787c84c0ec91730e3f589c0578e13e92913a21c56713e6bcaad2a310fdfc61e3b9eaec0b43b2434301cf8c3816a2e21485f7bc075146e38f42aaf090b65b5f16cd467844644a6f7e13cc3267fd10b2d4256371e0c98fd037429cd3709bb5bde4374a30f1eb98a325516145aaf752b0c670a53339b36b8a0620b516311d69927f550ddb7f2552049504a9693bac8268f1da8944df5ba245c08588c1d8aa002ae575ce5fc8692a5be1535f58b43001a5cfb039779df35990a0d73c91107b76cccb13571caf1a26af124b2692afbab0645410f6654de781ef8b2076ef044e2bfe463a8abb7279a502b834f3ef0656d067bf6df0379003b6bd97042d07dfc9074969fc84a928fccb430d957fa6b47c200f396ba8bb53f1ad7c7bf128b07af8e9a146f2cd47037cc40de6eaf7aab375d2055746faf4996cdb9c433873347482fec7351c9118e5654688ecbdb1300bf55064d3a90edfb7f08cd59a7d950b3333794acd97928030099dcd1f9dd26216385013db23aa8785fd0bfd274ec5f6ba47a5591dcc888719e74917ad5b77f5d92651b464c63da0c3b7fc2993fd1ae6630f49ea7883c31d04240acf3ba1d594eef2c1ca1cb5fc9c2909135e46b8bae6ab76cee8acb49d8e76e07f2694e802da8aba6234a62f0796a5554a36b4f1df631d97bbbd94a8477fd5a910a5bd7c67d31c9fa275f833b9b87db3a6c44b2ed1d780b94bafd34974834d5b7c9f260eed4bad13c2cf6129819934812f4d36ebb541401c20fb6f8954b168ec2c12339c1e6b80db0091299d95b153a65aa1863408f35684256519bc1c89f0c1c1faf7e86d40da04906f74cac0ea21d6b43a58c8280fda292303d7076efce087c8839153839661bf42440c0d8cb231cb7179cd387aa6a570d382990f53643c4c2de929b615f8b95f4117cd75129595033044ce80dee258d2e6984919f6d21535c9995d68e8d2620811e3fec36b445b3923947b8214ea1759437aaf60232c1dfdcca60293cd144c07c19423a3d15445483d63b4a626c8e7f02cb857e22a8d20ac08ebbb6417a2c629c1c81806bb729e5930dd18a9831ac601a23e4c5297d96ea83ddd44d1366f91d281aa45e73b0a10f4e4ab3083bfb9d3e2b2e47543b80c05b69dcdd357414ae2dba287f09a7ae4cfcb35871b572a3da0379389be0a8d90e10fd376adc7788a3f24406910e482e678c7a8bd59a79a6a449d87bcf4b37a76f18b57d7cde0b4e6bf38815f311f10a38f8fdffde69c87704ac6812a22596d7856ef5fef32c792de0f40b281c1dfb54cceaf851eab60ef3a6bdd8acd8a3f0ee992309720d9491960097ea257fbd9b5f7d5b0b61240c650b67c0a249d69b406c4a26aa87f10f07db519f5d27fe42bb61bb957217813450d2f861ff982b03eb9c480582b7810375268d58ad2456c4ebe4f63311c7f2cd4f9f611d730f580558e36eefec5a2ec0fbda184fa91f5b87a3c9d8d677798dc18f177e1bcdc39277fef6b495d219edbb239c2c4f4008ff3ae88f00de955f881d898bb7bedad59c28c2c7ac17c5bb689f7e2728d6411f293e82018b68f7d17dfd9c40315169532acbf748890afbc0177e4b01a8cc3717ce7a6a4b7ce560c06dbb5d8e18795508ef75b7fb89d4b158fa7357a04ace9f";

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address myAddress = 0xcCC05d9631e7B0F1E5629A62E79A9F1C84ad5dC5;
        vm.startBroadcast(deployerPrivateKey);

        FaceKeyRecover deployed = new FaceKeyRecover(64);
        deployed.register(
          myAddress,
          featureHash,
          commitmentHash,
          commitment
        );

        console.log(deployed.isRegistered(myAddress));

        HelloWorld pool = HelloWorld(0xE7AeCAaF670ed20432e78Fe6b5FAc0abAd4603D5);
        CallLib.Call[] memory calls = new CallLib.Call[](1);
        calls[0] = CallLib.Call({
            to: TypeCasts.addressToBytes32(address(0xE7AeCAaF670ed20432e78Fe6b5FAc0abAd4603D5)),
            data:  abi.encodeCall(pool.update, ("hello from moonbase")),
            value: 0.013633 ether - 160000000000
        });
        uint32 ethereumDomain = 11155111;
        bytes32 messageId = IInterchainAccountRouter(
          0x209Ccdbe13BB913104117B1D6f7801684e98FA1F
          ).callRemote(ethereumDomain, calls);
        // The moonbase DefaultIsmInterchainGasPaymaster
        IInterchainGasPaymaster igp = IInterchainGasPaymaster(
            0x8f9C3888bFC8a5B25AED115A82eCbb788b196d2a
        );
        // uint256 gasAmountToPay = igp.quoteGasPayment(ethereumDomain, 209736);
        // Pay with the msg.value
        igp.payForGas{value: 0.013633 ether - 160000000000} (
            // The ID of the message
            messageId,
            // Destination domain
            ethereumDomain,
            // The total gas amount. This should be the
            // overhead gas amount + gas used by the call being made
            209736,
            // Refund the msg.sender
            0xcCC05d9631e7B0F1E5629A62E79A9F1C84ad5dC5
        );
        // deployed.recover(
        //   myAddress,
        //   messageHash,
        //   proof
        // );
        // console.log(deployed.isRegistered(myAddress));
        // console.log(deployed.isRegistered(msg.sender));

        // deployed.register
        vm.stopBroadcast();
    }
}

