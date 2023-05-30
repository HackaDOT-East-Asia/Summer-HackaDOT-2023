import Sdk from '@unique-nft/sdk';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import '../../App.css';

import { waitReady } from '@polkadot/wasm-crypto';

const MintCollectionTest = () => {

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

    // Creating a sample token in the newly created collection
    // The signer specified in the SDK constructor is used to sign an extrinsic
    const createToken = async (sdk, address, collectionId) => {
        const { parsed, error } = await sdk.token.create.submitWaitResult({
            address,
            collectionId,
        });

        if (error) {
            console.log('create token error', error);
            process.exit();
        }

        const { tokenId } = parsed;
        
        return sdk.token.get({ collectionId, tokenId });
    }

    const Mint = async () => {
        await waitReady();

        const signer = await KeyringProvider.fromMnemonic(mnemonic);
        const address = signer.instance.address;

        const sdk = createSdk(signer);

        const token = await (createToken(sdk, address, 1367));
        console.log('token',token);
    }

    return(
        <>
            <button
                onClick={Mint}
                className='btn btn-blue'>
                    Mint
            </button>
        </>
    )
}
export default MintCollectionTest;