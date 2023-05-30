import Sdk from "@unique-nft/sdk";
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import '../../App.css';

import { waitReady } from "@polkadot/wasm-crypto";

const BurnNFTTest = () => {

    const baseUrl = 'https://rest.unique.network/opal/v1';
    const mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    
    // Creating an SDK client
    function createSdk(account) {
        const options = {
            baseUrl,
            signer: account,
        }
        return new Sdk(options);
    }

    const Burn = async () => {
        await waitReady();
        //signer
        const signer = await KeyringProvider.fromMnemonic(mnemonic);
        const address = signer.instance.address;

        //sdk
        const sdk = await createSdk(signer);
        //burn
        const burnItemArgs = {
            tokenId: 2,
            collectionId: 1367,
            address: address,
        }

        const result = await sdk.token.burn.submitWaitResult(burnItemArgs);

        console.log(`burned token ${result.tokenId} collection ${result.collectionId}`);
    }

    return(
        <>
            <button
                onClick={Burn}
                className="btn btn-hover">
                Burn
            </button>
        </>
    )
}
export default BurnNFTTest;