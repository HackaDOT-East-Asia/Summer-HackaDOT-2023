import Sdk from '@unique-nft/sdk';
import '../../App.css';
import {KeyringProvider} from '@unique-nft/accounts/keyring';
import {AttributeType, COLLECTION_SCHEMA_NAME, SchemaTools, UniqueCollectionSchemaToCreate} from '@unique-nft/schemas';

import { waitReady } from '@polkadot/wasm-crypto';

const LiveNFTTest = () => {

    const SDK_BASE_URL = 'https://rest.unique.network/opal/v1';
    const MNEMONIC = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';

    //NFT schemas
    const collectionSchema = {
        schemaName: COLLECTION_SCHEMA_NAME.unique,
        schemaVersion: '1.0.0',
        image: {urlTemplate: 'https://ipfs.unique.network/ipfs/QmcAcH4F9HYQtpqKHxBFwGvkfKb8qckXj2YWUrcc8yd24G/image{infix}.png'},
        coverPicture: {urlInfix: '1'},

        attributesSchemaVersion: '1.0.0',
        attributesSchema: {
            0: {
                name: {_: "seed1"},
                type: AttributeType.string,
                optional: true,
                isArray: false,
                enumValues: {
                    0: {_: 'state 0'},
                    1: {_: 'state 1'},
                    2: {_: 'state 2'},
                }
            },
            1: {
                name: {_: "seed2"},
                type: AttributeType.string,
                optional: true,
                isArray: false,
                enumValues: {
                    0: {_: 'state 0'},
                    1: {_: 'state 1'},
                    2: {_: 'state 2'},
                }
            },
        }
    }

    // Creating an SDK client
    function createSdk(account) {
        const options = {
            baseUrl: SDK_BASE_URL,
            signer: account,
        }
        return new Sdk(options);
    }

    const CreateLive = async () => {
        await waitReady();

        //signer
        const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
        const address = signer.instance.address;

        //sdk
        const sdk = createSdk(signer);

        //create live collection [Fungible]

            //
            const collectionCreateArgs = {
                address: address,
                name: 'Test fungible collection',
                description: 'just test',
                tokenPrefix: 'Test',
                schema: collectionSchema,
                tokenPropertyPermissions: [
                    {
                        key: 'a.0',
                        permission: {
                            tokenOwner: true,
                            collectionAdmin: true,
                            mutable: true,
                        },
                    },
                    {
                        key: 'a.1',
                        permission: {
                            tokenOwner: true,
                            collectionAdmin: true,
                            mutable: true,
                        },
                    },
                ]
            };

            const createResult = await sdk.collection.creation.submitWaitResult(collectionCreateArgs);

            const { collectionId } = createResult.parsed;

            console.log('created',collectionId);
            //const collection = await sdk.fungible.getCollection({ collectionId });
    }

    //Mint token
    const Mint = async () => {
        await waitReady();

        //signer
        const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
        const address = signer.instance.address;

        //sdk
        const sdk = createSdk(signer);

        //set properties
        const tokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '2',
            },
            encodedAttributes: {
                1: 0,
            }
        }, collectionSchema);

        //mint
        const tokenMintResult = await sdk.token.create.submitWaitResult({
            address: address,
            collectionId: 1390,
            //amount: 10,
            properties: tokenProperties,
            //recipient: address,
        });

        console.log(tokenMintResult.parsed.tokenId);
    }

    //Change State
    const ChangeState = async () => {
        await waitReady();

        //signer
        const signer = await KeyringProvider.fromMnemonic(MNEMONIC);
        const address = signer.instance.address;

        //sdk
        const sdk = createSdk(signer);

        //change state
        const tokenChangeResult = await sdk.token.setProperties.submitWaitResult({
            address: address,
            collectionId: 1390,
            tokenId: 1,
            properties: [{
                key: 'a.0',
                value: '1'
            }]
        });
    }



    return(
        <>
            <button
                onClick={CreateLive}
                className='btn btn-blue'>
                Create Fungible Live Collection
            </button>
            <button
                onClick={Mint}
                className='btn btn-blue'>
                Mint Fungible Live Collection
            </button>
            <button
                onClick={ChangeState}
                className='btn btn-blue'>
                Change Attribute
            </button>
        </>
    )
}
export default LiveNFTTest;