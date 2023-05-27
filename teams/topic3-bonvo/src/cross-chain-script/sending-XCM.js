import { ApiPromise, WsProvider } from '@polkadot/api'; // Version 9.13.6
import Keyring from '@polkadot/keyring'; // Version 10.3.1

// 1. Input Data
const providerWsURL = 'wss://frag-moonbase-relay-rpc-ws.g.moonbase.moonbeam.network';
const MNEMONIC = 'early flee science inch gadget twenty pen fix shiver bulk burst local'; // Not safe, only for testing
const txCall =
  '0xc10304630003000100a10f031000040000010403000f0080c6a47e8d03130000010403000f0080c6a47e8d030006010780bb470301007d0226000108e4000000000000000000000000000000000000000000000000000000000000007b9b40908ce6b559227b7fc9752b2b2ca5abe48b00000000000000000000000000000000000000000000000000000000000000001101095ea7b30000000000000000000000006bc7650a2edd0d607b7b5cfba67e0a62b19ee9f70000000000000000000000000000000000000000000000000de0b6b3a7640000000d0100000103004e21340c3465ec0aa91542de3d4c5f4fc1def526';

// 2. Create Keyring Instance
const keyring = new Keyring({ type: 'sr25519' });

const sendXCM = async () => {
  // 3. Create Substrate API Provider
  const substrateProvider = new WsProvider(providerWsURL);
  const api = await ApiPromise.create({ provider: substrateProvider });

  // 4. Create Account from Mnemonic
  const alice = keyring.addFromUri(MNEMONIC);

  // 5. Create the Extrinsic
  const tx = await api.tx(txCall).signAndSend(alice, (result) => {
    // 6. Check Transaction Status
    if (result.status.isInBlock) {
      console.log(`Transaction included in blockHash ${result.status.asInBlock}`);
    }
  });

  api.disconnect();
};

sendXCM();
