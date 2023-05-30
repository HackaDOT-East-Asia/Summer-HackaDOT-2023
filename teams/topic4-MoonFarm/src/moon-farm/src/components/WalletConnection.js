import { useContext, useState, useEffect } from 'react';
import { WalletContext } from '../App';
//SDK
import Sdk from '@unique-nft/sdk';

//Extension
import {Polkadot} from '@unique-nft/utils/extension'

export const WalletConnection = () => {
    //Context
    const { setSigner, setSdk } = useContext(WalletContext);

    //States
    const [_accounts, setAccounts] = useState([]);

    //Functions
    const selectAccount = (_account) => {
        setSigner(_account);

        //Connected Sdk
        const sdk = new Sdk({
            baseUrl: 'https://rest.unique.network/opal/v1',
            signer: _account.signer,
        });
        setSdk(sdk);
    }

    //Initialization
    const Initialization = async () => {

        //Load Wallets
        try {

            const res = await Polkadot.enableAndLoadAllWallets();
            //console.log(res.accounts);
            setAccounts(res.accounts);

            
        } catch(err) {
            /*
            if (err.extensionNotFound) {
                alert(`Please install some polkadot.js compatible extension`);
            } else if (err.accountsNotFound) {
                if (err.userHasWalletsButHasNoAccounts) {
                    alert(`Please, create an account in your wallet`);
                } else if (err.userHasBlockedAllWallets) {
                    //alert(`Please, grant access to at least one of your accounts`)
                    await Polkadot.requestAccounts();
                }
            } else {
                //alert(`Connection to polkadot extension failed: ${err.message}`);
            }
            */
        }
        
    }

    //
    useEffect(() => {
        Initialization();
    }, []);

    return(
        <>
            <div className="text-center">
                <h2 className="text-4xl text-white">Select an Account to Connect</h2>
                    {_accounts.map(account =>
                        <div key={account.address}>
                            <br/>
                            <div
                                className="div" key={account.address}>
                            <div className="p-4 md:p-5">
                                <h3 className="h3">
                                    {account.name}
                                </h3>
                                <p className="p">
                                    {account.address}
                                </p>
                                <button className="btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800"
                                   onClick={() => selectAccount(account)}>
                                    Select
                                </button>
                            </div>
                        </div>
                    </div>
                    )}
            </div>
        </>
    )
}
export default WalletConnection;