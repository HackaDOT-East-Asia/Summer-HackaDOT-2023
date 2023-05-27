import { useEffect, useState } from "react";
import "./App.css";
import { WalletSelect } from "@talismn/connect-components";
import { PolkadotjsWallet, TalismanWallet } from "@talismn/connect-wallets"
import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { ethers } from 'ethers'; // Version 6.0.2

function App() {
  const [address, setAddress] = useState(null);
  // 1. Input Data
  const evmProvider = 'wss://wss.api.moonbase.moonbeam.network';
  const relayProvider = 'wss://frag-moonbase-relay-rpc-ws.g.moonbase.moonbeam.network';
  // const txCall = '0xbd0204630003000100a10f031000040000010403000f0000c16ff28623130000010403000f0000c16ff286230006010780bb4703010079012600013a67000000000000000000000000000000000000000000000000000000000000000e88b6b910d1c929854034eaf66be202fa4e1625000000000000000000000000000000000000000000000000000000000000000010e8927fbc000d0100000103004e21340c3465ec0aa91542de3d4c5f4fc1def526';
  const aliceEVM = '0x0ae004989bcfe0af2ba479a1b5be4db02b50e097';
  const bonvoToken_contract = '0x7b9b40908ce6b559227b7fc9752b2b2ca5abe48b';
  const escrow = '0x6bc7650a2edd0d607b7b5cfba67e0a62b19ee9f7';

  const CallDataType = {
    Allowance: 0,
    Register: 1,
  }

  // get an array of wallets which are installed
  const Accounts = async () => {
    // returns an array of all the injected sources
    // (this needs to be called first, before other requests)
    const allInjected = await web3Enable('talisman');
    const allAccounts = await web3Accounts();
    console.log(address)
    console.log(allAccounts)
  }

  const SelectedAddress = (address) => {
    setAddress(address);
  };


  const buildBytesForAllowance = () => {
    // 0x095ea7b3 // Method
    // 0000000000000000000000006bc7650a2edd0d607b7b5cfba67e0a62b19ee9f7 // Escrow
    // 0000000000000000000000000000000000000000000000008ac7230489e80000 // Allowance (1 ETH)
    console.log('buildBytesForAllowance')
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
    const metadataURIBytes = ethers.hexlify(ethers.toUtf8Bytes(metadataURI)).slice(2).padEnd(64 * slotsNeeded, '0');
    return method + offset + length + metadataURIBytes;
  }

  const getEncodedData = async (api, contractAddress, contractCall) => {
    console.log('Getting encoded data...');
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
    console.log('Generating call data...');
    const substrateProvider = new WsProvider(evmProvider);
    const api = await ApiPromise.create({ provider: substrateProvider });

    if (callDataType === CallDataType.Allowance) {
      return getEncodedData(api, bonvoToken_contract, buildBytesForAllowance());
    } else if (callDataType === CallDataType.Register) {
      const contractCallBytes = buildBytesForRegister('https://bafkreihhwbeaqi4da2shmqwkcpkaq7txfp4epn7mwkmk3exzu4irwdj7au.ipfs.dweb.link/');
      return getEncodedData(api, escrow, contractCallBytes);
    }

    api.disconnect();
  };

  /* global BigInt */
  const buildXCMMessage = async (transactBytes, gasLimit) => {
    console.log('Building XCM message...');
    const substrateProvider = new WsProvider(relayProvider);
    const api = await ApiPromise.create({ provider: substrateProvider });

    // 1. Input Data
    const amountToWithdraw = BigInt(1 * 10 ** 16); // 0.01 DEV
    const devMultiLocation = { parents: 0, interior: { X1: { PalletInstance: 3 } } };
    const weightTransact = Number(gasLimit) * 50000; // 50000 * Gas limit of EVM call
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

  const generateAndCallXCM = async () => {
    console.log('Generating XCM message...');
    const [transactBytes, gasLimit] = await generateCallData(CallDataType.Allowance);
    const xcmMessage = await buildXCMMessage(transactBytes, gasLimit);
    await sendXCM(xcmMessage);
  };



  const sendXCM = async (xcmCallData) => {
    console.log('Sending XCM message...');
    // 2. Create Substrate API Provider
    const substrateProvider = new WsProvider(relayProvider);
    const api = await ApiPromise.create({ provider: substrateProvider });

    // 3. Enable extension and retrieve accounts
    await web3Enable('Bonvo cross chain');
    const accounts = await web3Accounts();

    if (accounts.length === 0) {
      console.error('No accounts found. Please install and unlock Polkadot.js extension wallet.');
      return;
    }

    const account = accounts[0]; // Select the first account for signing
    console.log('account:', accounts[0]);

    const injector = await web3FromAddress(account.address);
    api.setSigner(injector.signer);
    await api.tx(xcmCallData).signAndSend(account.address, (result) => {
      if (result.status.isInBlock) {
        console.log(`Transaction included in blockHash ${result.status.asInBlock}`);
      }
    });
    api.disconnect();
  };

  useEffect(() => {
    console.log(address);
    Accounts();
    SelectedAddress(address);
  }, [])

  const [buttonText, setButtonText] = useState('Open Wallet');
  const [buttonClicked, setButtonClicked] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleClick = () => {
    console.log('click');
    setButtonClicked(!buttonClicked);
    debugger;

    if (!address) {
      setButtonText('Try It');
    } else {
      generateAndCallXCM();
      setButtonDisabled(true);
    }

    // Add functionality for the button click here
  };

  return (
    <div className="App">


      <div className="container">
        <header>
          <img src="https://static.wixstatic.com/media/04671a_4e5e50c23d7d4af68347b565ba1bdbed~mv2.png/v1/fill/w_1000,h_123,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/04671a_4e5e50c23d7d4af68347b565ba1bdbed~mv2.png" className="logo" alt="logo" />
          <h1 className="title">Bonvo Rental POC</h1>
          <h2 className="subtitle">Cross-Chain XCM proof of concept to use the moonbase Uniswap functionality</h2>
        </header>
        <main>
          <p className="description">
            Implementing XCM features is crucial for our platform as it enhances interoperability and expands the functionality of our blockchain ecosystem. By integrating XCM, we can seamlessly communicate and interact with other blockchains within the Polkadot ecosystem, tapping into Moonbeam's EVM and unlocking collaboration opportunities. This enables our platform to leverage the benefits of multiple chains, bridge the gap between networks, and provide enhanced services and user experiences. Overall, XCM empowers our platform to be an innovative player in the blockchain landscape, fostering growth and expanding possibilities for our users.
            <br /><br />
            <b>Reference:</b>
            <br /> Info on XCM and Moonbase: <a href="https://docs.moonbeam.network/tutorials/interoperability/uniswapv2-swap-xcm/">Uniswap V2 Swap from Polkadot via XCM</a>
            <br />info cross-chain messaging: <a href="https://docs.moonbeam.network/learn/features/xchain-plans/">Cross-Chain integration</a>
          </p>

          {!address ?
            <WalletSelect
              dappName={"Talisman"}
              walletList={[
                new TalismanWallet(),
                new PolkadotjsWallet(),
              ]}
              triggerComponent={
                <button
                  className={`cta-button`}
                  onClick={handleClick}
                  disabled={buttonDisabled}
                >
                  {buttonText}
                </button>
              }
              onUpdatedAccounts={(accounts) => { SelectedAddress(accounts[0].address); }}
            />
            : <button
              className={`cta-button clicked`}
              onClick={handleClick}
              disabled={buttonDisabled}
            >
              {buttonText}
            </button>
          }

        </main>
        <footer>
          <p>Created by</p>

          <a href="https://bonvonft.com"><img src="https://www.bonvonft.com/assets/img/logo_floating.png" className="logo" alt="logo" /></a>
          <p>&copy; 2023 Bonvo. All rights reserved.</p>
        </footer>
      </div>




    </div>
  );
}

export default App;
