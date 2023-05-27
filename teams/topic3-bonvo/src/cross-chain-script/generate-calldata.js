import { ApiPromise, WsProvider } from '@polkadot/api'; // Version 9.13.6
import { ethers } from 'ethers'; // Version 6.0.2

// 1. Input Data
const providerWsURL = 'wss://wss.api.moonbase.moonbeam.network';
const bonvoToken = '0x7b9b40908ce6b559227b7fc9752b2b2ca5abe48b';
const escrow = '0x6bc7650a2edd0d607b7b5cfba67e0a62b19ee9f7';
const aliceEVM = '0x393ccBa82B2ab518194Bd5F4B19B16160AAb55c6'; // 0x0ae004989bcfe0af2ba479a1b5be4db02b50e097
const contractCallRegister = '0x704f1b940000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000005368747470733a2f2f6261666b72656968687762656171693464613273686d71776b63706b617137747866703465706e376d776b6d6b3365787a7534697277646a3761752e697066732e647765622e6c696e6b2f00000000000000000000000000'

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

const generateCallData = async () => {
  // 1. Build call bytes
  const contractCallAllowance = buildBytesForAllowance();
  const contractCallRegister = buildBytesForRegister('https://bafkreihhwbeaqi4da2shmqwkcpkaq7txfp4epn7mwkmk3exzu4irwdj7au.ipfs.dweb.link/');

  // 2. Create Substrate API Provider
  const substrateProvider = new WsProvider(providerWsURL);
  const ethProvider = new ethers.WebSocketProvider(providerWsURL);
  const api = await ApiPromise.create({ provider: substrateProvider });

  getEncodedData(api, ethProvider, bonvoToken, contractCallAllowance);
  getEncodedData(api, ethProvider, escrow, contractCallRegister);

  api.disconnect();
};


const getEncodedData = async (api, ethProvider, contractAddress, contractCall) => {
//   // 3. Estimate Gas for EVM Call
  const gasLimit = await ethProvider.estimateGas({
    to: contractAddress,
    data: contractCall,
    from: aliceEVM
    // value: ethers.parseEther('0.01'),
  });
  console.log(`Gas required for call is ${gasLimit.toString()}`);

  // 4. Call Parameters
  const callParams = {
    V2: {
      gasLimit: gasLimit + gasLimit, // Estimated plus some extra gas
      action: { Call: contractAddress }, // Contract Address
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
