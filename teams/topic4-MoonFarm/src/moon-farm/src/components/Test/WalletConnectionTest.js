import { useState, useEffect } from 'react';

import '../../App.css';

//SDK
import Sdk from '@unique-nft/sdk';

//Extension
import {Polkadot} from '@unique-nft/utils/extension'

const sdk = new Sdk({
    baseUrl: 'https://rest.unique.network/opal/v1',
})

const WalletConnectionTest = () => {

    //States
    const [_accounts, setAccounts] = useState([]);
    const [_signer, setSigner] = useState();

    //Functions
    const selectAccount = (_account) => {
        setSigner(_account);
    }

    const getMyBalance = async () => {

        if (!_signer) {
            throw new Error('no account');
        }

        const balance = await sdk.balance.get({
            //address: '5EnCfZ1Y5FX3jVWb7CAm31kpJSoDjhqmk7zyzK7ZwvvJUKoD'
            address: _signer.address,
        })
        console.log(balance.availableBalance.amount);
    }

    const transferTo = async () => {
        try {
        const res = await sdk.balance.transfer.submitWaitResult({
            address: _signer.address,

            //test2 address
            //destination: '5Fv8UXonR2JL9VjjiDaqfKgg7GRtZdSEmxiH4wifWW3qaZc3',
            //test1 address
            destination: '5EnCfZ1Y5FX3jVWb7CAm31kpJSoDjhqmk7zyzK7ZwvvJUKoD',

            amount: 1,
        }, {
            signer: _signer
        })

        //result
        if (res.error) {
            console.log(res.error.message);
            alert(res.error.message);
        } else {
            //success
            console.log(res.parsed);
        }
        
        } catch (err) {
            console.log(err);
        }
    }

    //Initialization
    const Initialization = async () => {

        //Wallet Connection
        try {

            const res = await Polkadot.enableAndLoadAllWallets();
            //console.log(res.accounts);
            setAccounts(res.accounts);

        } catch(err) {
            if (err.extensionNotFound) {
                //alert(`Please install some polkadot.js compatible extension`);
            } else if (err.accountsNotFound) {
                if (err.userHasWalletsButHasNoAccounts) {
                    //alert(`Please, create an account in your wallet`);
                } else if (err.userHasBlockedAllWallets) {
                    //alert(`Please, grant access to at least one of your accounts`)
                    await Polkadot.requestAccounts();
                }
            } else {
                //alert(`Connection to polkadot extension failed: ${err.message}`);
            }
        }
    }
    
    //
    useEffect(() => {
        Initialization();
    }, []);

    return(
        <>
        <div>
            {_signer && <h2>Current Account: {_signer.address}</h2>}
        </div>
        <div>
            {_accounts.map(account =>
                <div key={account.address}>
                    Account {account.address}
                    <button
                        onClick={() => selectAccount(account)}
                        className='btn btn-blue'>
                            Select
                    </button>
                </div>
            )}
        </div>

        {_signer && <div>
                        <button
                            onClick={transferTo}
                            className='btn btn-blue'>
                                Transfer
                        </button>
                        <button
                            onClick={getMyBalance}
                            className='btn btn-blue'>
                                Get My Balance
                        </button>
                    </div>
        }
        
        </>
    )
}
export default WalletConnectionTest;