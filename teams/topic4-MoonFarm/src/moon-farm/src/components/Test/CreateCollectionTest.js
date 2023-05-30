import Sdk from '@unique-nft/sdk';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import '../../App.css';

import { waitReady } from '@polkadot/wasm-crypto';

const CreateCollectionTest = () => {

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

    // Creating a sample collection
    // The signer specified in the SDK constructor is used to sign an extrinsic
    const createCollection = async (sdk, address) => {
        const { parsed, error } = await sdk.collection.creation.submitWaitResult({
            address,
            name: 'Test collection',
            description: 'My test collection',
            tokenPrefix: 'TST',
            permissions: {
                nesting: {
                    tokenOwner: true,
                    collectionAdmin: true,
                }
            }
          });

        if (error) {
            console.log('The error occurred while creating a collection. ', error);
            process.exit();
        }

        const { collectionId } = parsed;

        return sdk.collection.get({ collectionId });
    }

    const Create = async () => {
        await waitReady();
        
        const signer = await KeyringProvider.fromMnemonic(mnemonic);
        const address = signer.instance.address;

        const sdk = createSdk(signer);

        const collection = await createCollection(sdk, address);
        console.log('The collection was create. ID: ', collection);
    }

    return(
        <>
            <button
                onClick={Create}
                className='btn btn-blue'>
                Create Collection
            </button>
        </>
    )
}
export default CreateCollectionTest;