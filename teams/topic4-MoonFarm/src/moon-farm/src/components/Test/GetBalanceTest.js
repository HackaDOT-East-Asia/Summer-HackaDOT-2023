import React from 'react';

import '../../App.css';
import Sdk from '@unique-nft/sdk';

import { waitReady } from '@polkadot/wasm-crypto';
import { getAccountFromMnemonic } from '@unique-nft/accounts';

const GetBalanceTest = () => {
    
    const Get = async () =>  {
        await waitReady();
    
        const account = await getAccountFromMnemonic({
            mnemonic: 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh',
        })
    
        console.log(account.keyfile.address);

        const options = {
            baseUrl: 'https://rest.unique.network/opal/v1'
        };
        const sdk = new Sdk(options);

        const BalRes = sdk.balance.get({ address: account.keyfile.address });

        console.log("availableBalance: "+(await BalRes).availableBalance.formatted);
    }
    
    return(
        <>
            <button
                onClick={Get}
                className='btn btn-blue'>
                    Get Balance
            </button>
        </>
    )
}
export default GetBalanceTest;