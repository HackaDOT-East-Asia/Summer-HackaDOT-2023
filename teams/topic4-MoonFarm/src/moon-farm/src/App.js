//import logo from './logo.svg';
import './App.css';

//
import React, { createContext, useState, useEffect } from 'react';

//
import { Routes, Route, useNavigate } from 'react-router-dom';

//Testing Components
import GetBalanceTest from './components/Test/GetBalanceTest';

import CreateCollectionTest from './components/Test/CreateCollectionTest';
import MintCollectionTest from './components/Test/MintCollectionTest';
import NestedNFTTest from './components/Test/NestedNFTTest';
import CheckBundleTest from './components/Test/CheckBundleTest';
import BurnNFTTest from './components/Test/BurnNFTTest';

import LiveNFTTest from './components/Test/LiveNFTTest';

import FungibleTest from './components/Test/FungibleTest';

import WalletConnectionTest from './components/Test/WalletConnectionTest';

//Release
import CollectionDeployment from './collection/CollectionDeployment';

import { WalletConnection } from './components/WalletConnection';

//Pages
import GamePage from './pages/GamePage';

//Test Pages
import UITest from './pages/Test/UITest';

//Game Token
import { exchangeGameToken } from './utils/GameToken';

//Bryant
import { setProperties, getProperties } from './utils/DynamicToken';
import { KeyringProvider } from "@unique-nft/accounts/keyring";
import Sdk from '@unique-nft/sdk';
import { waitReady } from '@polkadot/wasm-crypto';

export const WalletContext = createContext();

function App() {
  //States
  //const [_accounts, setAccounts] = useState([]);
  const [_signer, setSigner] = useState();
  const [_sdk, setSdk] = useState();

  const setthisProperties = async () => {
    waitReady();
    const baseUrl = 'https://rest.unique.network/opal/v1';
    function createSdk(account) {
        const options = {
            baseUrl,
            signer: account,
        }
        return new Sdk(options);
    }
    const owner_mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const owner_account = await KeyringProvider.fromMnemonic(owner_mnemonic);
    const owner_address = owner_account.address;
    const owner_sdk = createSdk(owner_account);
    const args = {
      address: owner_address,
      collectionId: 1635,
      tokenId: 2,
      properties: [{
          key: 'a.1',
          value: 'aaaaaa',
      }]
    };
    const res = await owner_sdk.token.setProperties.submitWaitResult(args);
    console.log(res);
  }

  //Page History Hook
  const navigate = useNavigate();

  useEffect(()=> {
    
  }, [])

  //FUNCTIONS
  const Clean = () => {
    setSigner([null]);
    setSdk(null);

    navigate('/');
  }

  return (
    <div className="App text-center">
      <header className="Moon-Farm">

        <link rel="preconnect" href="https://fonts.googleapis.com"/>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true"/>
            <link href="https://fonts.googleapis.com/css2?family=Cute+Font&display=swap" rel="stylesheet"/>

        <Routes>
          
          <Route path='/' element={
            <>
              <h1 className="text-6xl font-bold text-amber-400">
                Moon Farm
              </h1>

              {!(_sdk && _signer) && (
                <WalletContext.Provider value={{ _signer, setSigner, _sdk, setSdk }}>
                  <div>
                    <WalletConnection />
                  </div>
                </WalletContext.Provider>
              )}

              {(_sdk && _signer) && (
                <div>
                  <h2 className="h2">Connected: {_signer.address}</h2>
                  <button
                    onClick={Clean}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                      Switch Account
                  </button>
                  &nbsp;&nbsp;&nbsp;
                  <button
                    onClick={() => navigate('/game')}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                      Play
                  </button>
                  &nbsp;&nbsp;&nbsp;
                  <button
                    onClick={() => exchangeGameToken(_sdk, _signer)}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                      Exchange 100 UNQ for 20 Moon Farm Tokens
                  </button>
                  &nbsp;&nbsp;&nbsp;
                  <button
                    onClick={() => navigate('/uitest')}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                      TestUI
                  </button>
                  <button
                    onClick={() => setthisProperties()}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                      Set P
                  </button>
                  <button
                    onClick={() => getProperties(_sdk, _signer, 2)}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                      Get P
                  </button>
                </div>
              )}

              
                <div className='Initialization'>
                  <CollectionDeployment />
                </div>
             

              {/*
                <div className='Workshop'>
                  <WalletConnectionTest />
                </div>
              */}

              {/*
                <div className='Account'>
                  <GetBalanceTest />
                </div>

                <div className='Collection'>
                  <CreateCollectionTest />
                  <MintCollectionTest />
                  <NestedNFTTest />
                  <CheckBundleTest />
                  <BurnNFTTest />
                </div>

                <div className='Live Collection'>
                  <LiveNFTTest />
                </div>

                <div className='Fungible'>
                  <FungibleTest />
                </div>
              */}

            </>
          }/>

          <Route path='/game' element={<GamePage sdk={_sdk} signer={_signer} />}/>
          <Route path='/uitest' element={<UITest sdk={_sdk} signer={_signer}/>}/>

        </Routes>
      </header>
    </div>
  );
}

export default App;
