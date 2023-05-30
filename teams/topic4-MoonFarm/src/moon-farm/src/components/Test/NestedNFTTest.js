import Sdk from '@unique-nft/sdk';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
import '../../App.css';

import { waitReady } from '@polkadot/wasm-crypto';

const baseUrl = 'https://rest.unique.network/opal/v1';
const mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';

const NestedNFTTest = () => {

    // Creating an SDK client
    function createSdk(account) {
        const options = {
            baseUrl,
            signer: account,
        }
        return new Sdk(options);
    }

    //steps
    //1. create a collection
    //2. mint a token which will be nested
    //3. nested the minted token with other token
    //4. unnest it before transfer

    const createNestedToken = async (sdk, nestedArgs) => {
        const { address, parent, nested } = nestedArgs;
        const { parsed, error } = await sdk.token.nest.submitWaitResult({
            address,
            parent,
            nested,
        });

        if (error) {
            console.log('create token error', error);
            process.exit();
        }
        
        const { collectionId, tokenId } = parsed;
        
        console.log(`Token ${tokenId} from collection ${collectionId} successfully nested`);
        
        return sdk.token.get({ collectionId, tokenId });
    }

    const Create = async () => {
        await waitReady();

        const signer = await KeyringProvider.fromMnemonic(mnemonic);
        const address = signer.instance.address;

        const sdk = createSdk(signer);

        //putting tokenId 2 in tokenId 1
        const nestedToken = await createNestedToken(sdk, {
            address,
            parent: {
                collectionId: 1370,
                tokenId: 1,
            },
            nested: {
                collectionId: 1368,
                tokenId: 2,
            }
        })

        console.log('nestedToken',nestedToken);
    }

    //Unnest
    const createUnNestedToken = async (sdk, nestedArgs) => {
        const { address, parent, nested } = nestedArgs;
        const { parsed, error } = await sdk.token.unnest.submitWaitResult({
            address,
            parent,
            nested,
        });

        if (error) {
            console.log('unnest token error', error);
            process.exit();
        }

        const { collectionId, tokenId } = parsed;

        console.log(`Token ${tokenId} from collection ${collectionId} successfully unnested`);
    
        return sdk.token.get({ collectionId, tokenId });
    }

    const Unnest = async () => {
        await waitReady();
        
        const signer = await KeyringProvider.fromMnemonic(mnemonic);
        const address = signer.instance.address;

        const sdk = createSdk(signer);

        const unNestedToken = await createUnNestedToken(sdk, {
            address,
            parent: {
                collectionId: 1370,
                tokenId: 1,
            },
            nested: {
                collectionId: 1368,
                tokenId: 2,
            },
        });

        console.log('unNestedToken',unNestedToken);
    }

    return(
        <>
            <button
                onClick={Create}
                className='btn btn-blue'>
                Create Nested NFT
            </button>

            <button
                onClick={Unnest}
                className='btn btn-blue'>
                Unnest NFT
            </button>
        </>
    )
}
export default NestedNFTTest;