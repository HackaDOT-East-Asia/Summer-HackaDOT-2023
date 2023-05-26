import { ApiPromise, WsProvider } from '@polkadot/api'; // Version 9.13.6
import { ethers } from 'ethers'; // Version 6.0.2

// 1. Input Data
const providerWsURL = 'wss://wss.api.moonbase.moonbeam.network';
const counter = '0x0E88B6b910D1c929854034eaF66BE202fA4e1625';
const contractCall =
  '0xe8927fbc';

const generateCallData = async () => {
  // 2. Create Substrate API Provider
  const substrateProvider = new WsProvider(providerWsURL);
  const ethProvider = new ethers.WebSocketProvider(providerWsURL);
  const api = await ApiPromise.create({ provider: substrateProvider });

//   // 3. Estimate Gas for EVM Call
  const gasLimit = await ethProvider.estimateGas({
    to: counter,
    data: contractCall,
    // value: ethers.parseEther('0.01'),
  });
  console.log(`Gas required for call is ${gasLimit.toString()}`);

  // 4. Call Parameters
  const callParams = {
    V2: {
      gasLimit: gasLimit, // Estimated plus some extra gas
      action: { Call: counter }, // Uniswap V2 router address
    //   value: ethers.parseEther('0.01'), // 0.01 DEV
      input: contractCall, // Swap encoded calldata
    },
  };

  // 5. Create the Extrinsic
  const tx = api.tx.ethereumXcm.transact(callParams);

  // 6. Get SCALE Encoded Calldata
  const encodedCall = tx.method.toHex();
  console.log(`Encoded Calldata: ${encodedCall}`);

  api.disconnect();
};

generateCallData();
