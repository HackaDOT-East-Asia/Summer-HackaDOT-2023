import Sdk from '@unique-nft/sdk';
import {KeyringProvider} from '@unique-nft/accounts/keyring';
import '../../App.css';

import { waitReady } from '@polkadot/wasm-crypto';

const FungibleTest = () => {
    //setup
    const SDK_BASE_URL = 'https://rest.unique.network/opal/v1';
    const MNEMONIC = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';

    // Creating an SDK client
    function createSdk(account) {
        const options = {
            baseUrl: SDK_BASE_URL,
            signer: account,
        }
        return new Sdk(options);
    }

    //Flow
    //
    //signer
    //sdk
    //create fungible collection
    //mint

    const CreateFungibleCollection = async () => {
        await waitReady();
        //signer
        const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
        const address = signer.instance.address;

        //sdk
        const sdk = createSdk(signer);

        //collection args
        const collectionArgs = {
            address: address,
            name: 'Test fungible collection',
            description: 'just test',
            tokenPrefix: 'TEST',
            decimals: 10,
        };

        //
        const createResult = await sdk.fungible.createCollection.submitWaitResult(collectionArgs);

        console.log('collection created: '+createResult.collectionId);

    }

    const MintFungibleCollection = async () => {
        await waitReady();
        //signer
        const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
        const address = signer.instance.address;

        //sdk
        const sdk = createSdk(signer);

        //token args
        const tokenArgs = {
            address: address,
            collectionId: 1410,
            amount: 666,
            recipient: address,
        }

        await sdk.fungible.addTokens.submitWaitResult(tokenArgs);

    }

    const GetFungibleBalance = async () => {
        await waitReady();
        //signer
        const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
        const address = signer.instance.address;

        //sdk
        const sdk = createSdk(signer);

        const accountBalance = await sdk.fungible.getBalance({ collectionId: 1410, address: address });
        const { formatted, unit } = accountBalance;

    console.log(`Balance is ${formatted}${unit}`); // 'Balance is 100.0000 mTEST'

    }
    

    return(
        <>
            <button
                onClick={CreateFungibleCollection}
                className='btn btn-blue'>
                    CreateFungibleCollection
            </button>
            <button
                onClick={MintFungibleCollection}
                className='btn btn-blue'>
                    MintFungibleCollection
            </button>
            <button
                onClick={GetFungibleBalance}
                className='btn btn-blue'>
                    GetFungibleBalance
            </button>
        </>
    )
}
export default FungibleTest;