import { ApiPromise, WsProvider } from '@polkadot/api'; // Version 9.13.6
import Keyring from '@polkadot/keyring'; // Version 10.3.1
import { ethers } from 'ethers'; // Version 6.0.2

// 1. Input Data
const evmProvider = 'wss://wss.api.moonbase.moonbeam.network';
const relayProvider = 'wss://frag-moonbase-relay-rpc-ws.g.moonbase.moonbeam.network';
const bonvoToken = '0x7b9b40908ce6b559227b7fc9752b2b2ca5abe48b';
const escrow = '0x6bc7650a2edd0d607b7b5cfba67e0a62b19ee9f7';
const aliceEVM = '0x0ae004989bcfe0af2ba479a1b5be4db02b50e097';
const MNEMONIC = 'early flee science inch gadget twenty pen fix shiver bulk burst local'; // Not safe, only for testing

const CallDataType = {
	Allowance: 0,
	Register: 1,
}

const buildBytesForAllowance = () => {
  // 0x095ea7b3 // Method
  // 0000000000000000000000006bc7650a2edd0d607b7b5cfba67e0a62b19ee9f7 // Escrow
  // 0000000000000000000000000000000000000000000000008ac7230489e80000 // Allowance (1 ETH)
  const method = '0x095ea7b3';
  const escrowBytes = escrow.slice(2).padStart(64, '0');
  const allowanceBytes = ethers.parseEther('1').toString(16).padStart(64, '0');
  return method + escrowBytes + allowanceBytes;
}

const buildBytesForRegister = (metadataURI) => {
  // 0x704f1b94 // Method
  // 0000000000000000000000000000000000000000000000000000000000000020 // Offset, or is it bytes used?
  // 0000000000000000000000000000000000000000000000000000000000000053 // Length
  // 68747470733a2f2f6261666b72656968687762656171693464613273686d7177 // metadata URI as hex
  // 6b63706b617137747866703465706e376d776b6d6b3365787a7534697277646a
  // 3761752e697066732e647765622e6c696e6b2f00000000000000000000000000 
  const method = '0x704f1b94';
  const offset = '0000000000000000000000000000000000000000000000000000000000000020';
  const length = metadataURI.length.toString(16).padStart(64, '0');
  const slotsNeeded = Math.ceil((metadataURI.length * 2) / 64);
  const metadataURIBytes = ethers.hexlify(ethers.toUtf8Bytes(metadataURI)).slice(2).padEnd(64*slotsNeeded, '0');
  return method + offset + length + metadataURIBytes;
}

const getEncodedData = async (api, contractAddress, contractCall) => {
  const ethProvider = new ethers.WebSocketProvider(evmProvider);

  const gasLimit = (await ethProvider.estimateGas({
    to: contractAddress,
    data: contractCall,
    from: aliceEVM
    // value: ethers.parseEther('0.01'),
  })) * 2n;
  console.log(`Gas required for call is ${gasLimit.toString()}`);

  const callParams = {
    V2: {
      gasLimit: gasLimit, // Estimated plus some extra gas
      action: { Call: contractAddress }, // Contract Address
    //   value: ethers.parseEther('0.01'), // 0.01 DEV
      input: contractCall, // Swap encoded calldata
    },
  };

  const tx = api.tx.ethereumXcm.transact(callParams);

  const encodedCall = tx.method.toHex();
  console.log(`EVM Calldata: ${encodedCall}`);
  return [encodedCall, gasLimit];
};

const generateCallData = async (callDataType) => {
  const substrateProvider = new WsProvider(evmProvider);
  const api = await ApiPromise.create({ provider: substrateProvider });

  if (callDataType === CallDataType.Allowance) {
    return getEncodedData(api, bonvoToken, buildBytesForAllowance());
  } else if (callDataType === CallDataType.Register) {
    const contractCallBytes = buildBytesForRegister('https://bafkreihhwbeaqi4da2shmqwkcpkaq7txfp4epn7mwkmk3exzu4irwdj7au.ipfs.dweb.link/');
    return getEncodedData(api, escrow, contractCallBytes);
  }

  api.disconnect();
};

const buildXCMMessage = async (transactBytes, gasLimit) => {
  const substrateProvider = new WsProvider(relayProvider);
  const api = await ApiPromise.create({ provider: substrateProvider });

  // 1. Input Data
  const amountToWithdraw = BigInt(1 * 10 ** 16); // 0.01 DEV
  const devMultiLocation = { parents: 0, interior: { X1: { PalletInstance: 3 } } };
  const weightTransact = Number(gasLimit) * 50000 ; // 50000 * Gas limit of EVM call
  const multiLocAccount = '0x4e21340c3465ec0aa91542de3d4c5f4fc1def526';

  // 2. XCM Destination (Moonbase Alpha Parachain ID 1000)
  const dest = { V3: { parents: 0, interior: { X1: { Parachain: 1000 } } } };

  // 3. XCM Instruction 1
  const instr1 = {
    WithdrawAsset: [
      {
        id: { Concrete: devMultiLocation },
        fun: { Fungible: amountToWithdraw },
      },
    ],
  };

  // 4. XCM Instruction 2
  const instr2 = {
    BuyExecution: {
      fees: {
        id: { Concrete: devMultiLocation },
        fun: { Fungible: amountToWithdraw },
      },
      weightLimit: { 'Unlimited': null },
    },
  };

  // 5. XCM Instruction 3
  const instr3 = {
    Transact: {
      originKind: 'SovereignAccount',
      requireWeightAtMost: { refTime: weightTransact, proofSize: 0 },
      call: {
        encoded: transactBytes,
      },
    },
  };

  // 6. XCM Instruction 4
  const instr4 = {
    DepositAsset: {
      assets: { Wild: 'All' },
      beneficiary: {
        parents: 0,
        interior: { X1: { AccountKey20: { key: multiLocAccount } } },
      },
    },
  };

  // 7. Build XCM Message
  const message = { V3: [instr1, instr2, instr3, instr4] };

  // 9. Create the Extrinsic
  const tx = api.tx.xcmPallet.send(dest, message);

  // 10. Get SCALE Encoded Calldata
  const encodedCall = tx.toHex();
  console.log(`XCM Calldata: ${encodedCall}`);

  api.disconnect();

  return encodedCall;
}

const sendXCM = async (xcmCallData) => {
  const keyring = new Keyring({ type: 'sr25519' });

  // 3. Create Substrate API Provider
  const substrateProvider = new WsProvider(relayProvider);
  const api = await ApiPromise.create({ provider: substrateProvider });

  // 4. Create Account from Mnemonic
  const alice = keyring.addFromUri(MNEMONIC);

  // 5. Create the Extrinsic
  const tx = await api.tx(xcmCallData).signAndSend(alice, (result) => {
    // 6. Check Transaction Status
    if (result.status.isInBlock) {
      console.log(`Transaction included in blockHash ${result.status.asInBlock}`);
    }
  });

  api.disconnect();
};


const run = async () => {

  const [transactBytes, gasLimit] = await generateCallData(CallDataType.Allowance);
  const xcmMessage = await buildXCMMessage(transactBytes, gasLimit);
  await sendXCM(xcmMessage);
};

run().catch(console.error).finally(() => process.exit());
