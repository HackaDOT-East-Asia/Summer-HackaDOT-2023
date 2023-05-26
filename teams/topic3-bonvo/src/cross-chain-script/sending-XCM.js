import { ApiPromise, WsProvider } from '@polkadot/api'; // Version 9.13.6
import Keyring from '@polkadot/keyring'; // Version 10.3.1

// 1. Input Data
const providerWsURL = 'wss://frag-moonbase-relay-rpc-ws.g.moonbase.moonbeam.network';
const MNEMONIC = 'early flee science inch gadget twenty pen fix shiver bulk burst local'; // Not safe, only for testing
const txCall =
  '0xbd0204630003000100a10f031000040000010403000f0000c16ff28623130000010403000f0000c16ff286230006010780bb4703010079012600013a67000000000000000000000000000000000000000000000000000000000000000e88b6b910d1c929854034eaf66be202fa4e1625000000000000000000000000000000000000000000000000000000000000000010e8927fbc000d0100000103004e21340c3465ec0aa91542de3d4c5f4fc1def526';

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
