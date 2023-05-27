import { ApiPromise, WsProvider } from '@polkadot/api'; // Version 9.13.6

// 1. Input Data
const providerWsURL = 'wss://frag-moonbase-relay-rpc-ws.g.moonbase.moonbeam.network';
const amountToWithdraw = BigInt(1 * 10 ** 16); // 0.01 DEV
const devMultiLocation = { parents: 0, interior: { X1: { PalletInstance: 3 } } };
const weightTransact = BigInt(4350000000); // 25000 * Gas limit of EVM call
const multiLocAccount = '0x4e21340c3465ec0aa91542de3d4c5f4fc1def526';
const transactBytesAllowance = '0x26000108e4000000000000000000000000000000000000000000000000000000000000007b9b40908ce6b559227b7fc9752b2b2ca5abe48b00000000000000000000000000000000000000000000000000000000000000001101095ea7b30000000000000000000000006bc7650a2edd0d607b7b5cfba67e0a62b19ee9f70000000000000000000000000000000000000000000000000de0b6b3a764000000';
const transactBytesRegister = '0x2600014431080000000000000000000000000000000000000000000000000000000000006bc7650a2edd0d607b7b5cfba67e0a62b19ee9f700000000000000000000000000000000000000000000000000000000000000009102704f1b940000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000005368747470733a2f2f6261666b72656968687762656171693464613273686d71776b63706b617137747866703465706e376d776b6d6b3365787a7534697277646a3761752e697066732e647765622e6c696e6b2f0000000000000000000000000000';

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
      encoded: transactBytesAllowance,
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

const generateCallData = async () => {
  // 8. Create Substrate API Provider
  const substrateProvider = new WsProvider(providerWsURL);
  const api = await ApiPromise.create({ provider: substrateProvider });

  // 9. Create the Extrinsic
  const tx = api.tx.xcmPallet.send(dest, message);

  // 10. Get SCALE Encoded Calldata
  const encodedCall = tx.toHex();
  console.log(`Encoded Calldata: ${encodedCall}`);

  api.disconnect();
};

generateCallData();