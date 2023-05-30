
/*  Collection Deployment Component */
/* ************************************************************************************* */
/*                                                                                       */
/*  Using the shared-mnemonic for testing                                                */
/*  robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh     */
/*  address: 5EhUTrFBYVthKo9wns5QVcLBDq7MNf9H3AZ9xAGnTXAfYSTp                            */
/*                                                                                       */
/* ************************************************************************************* */

//
import { useState, useEffect } from "react";

import '../App.css';

//
import { KeyringProvider } from "@unique-nft/accounts/keyring";

import Sdk from '@unique-nft/sdk';

import { waitReady } from "@polkadot/wasm-crypto";

import { AttributeType, COLLECTION_SCHEMA_NAME, SchemaTools } from "@unique-nft/schemas";

import { UniqueCollectionSchemaToCreate } from "@unique-nft/schemas";

import { mintToken, nestData, nestToken, createUnNestedToken, burnToken, transfer } from "../utils/Game";

const CollectionDeployment = () => {

    const [_account, setAccount] = useState();
    const [sdk, setSdk] = useState();

    //INITIALIZATION
    const Initialization = async () => {
        await waitReady();

        const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';

        const _account = await KeyringProvider.fromMnemonic(_mnemonic);
        setAccount(_account);

        const sdk = new Sdk({
            baseUrl: 'https://rest.unique.network/opal/v1',
            signer: _account,
        });
        setSdk(sdk);
    }

    useEffect(()=> {
        Initialization();
    }, [])

    //DEPLOY_FUNCTIONS

    //Farm, Seeds, Scarecrow, Auto-watering,Fertilize Collection
    const Collection_FSSAFC = async () => {
        async function createNestedCollection(){
            const landCollectionArgs ={
                address: _account.address,
                name: 'Moon Farm Land',
                description: 'MFL',
                tokenPrefix: 'MFL',
                schema: SeedSchema,
                tokenPropertyPermissions: [
                    {
                        key: 'a.0',
                        permission: {
                            tokenOwner: true,
                            collectionAdmin: true,
                            mutable: false,
                        },
                    }
                ],
                permissions: {
                    nesting: {
                        tokenOwner: true,
                        collectionAdmin: true,
                    }
                },
            };

            const {parsed, error} = await sdk.collection.creation.submitWaitResult(landCollectionArgs);
            if (error) {
                console.log('create collection error', error);
                process.exit();
            }
            const {collectionId} = parsed;
            return sdk.collection.get({collectionId});
        }

        const collection = await createNestedCollection();
        console.log('land collection', collection);
    }

    //Land Collection
    const MintLand = async () => {
        const onetwowords = 'direct recall turtle kitchen frog planet fly power imitate fly nature quality';
        const signer = await KeyringProvider.fromMnemonic(onetwowords);
        console.log('address', signer.address);
        const landTokenArgs = {
            address: _account.address,
            collectionId: 1619,
            name: 'Land',
            description: 'Land token for nesting',
            // data: {
            //     data: nestData.parentToken,
            //     image: {
            //         url: nestData.parentToken.image.url,
            //     }
            // }
        }
        const landToken = await mintToken(sdk, landTokenArgs);
        console.log('land token: ', landToken);
        console.log('id', landToken.tokenId);
        const transferArgs = {
            address: _account.address,
            to: signer.address,
            collectionId: 1619,
            tokenId: landToken.tokenId,
        }
        const landowner = await transfer(sdk, transferArgs);
    }

    //seed collection
    const seed_collection = async () => {
        async function createNestedCollection(){
            const seedCollectionArgs ={
                address: _account.address,
                name: 'Moon Farm Seed Balance',
                description: 'MFSB',
                tokenPrefix: 'MFSB',
                schema: SeedSchema,
                tokenPropertyPermissions: [
                    {
                        key: 'a.0',
                        permission: {
                            tokenOwner: true,
                            collectionAdmin: true,
                            mutable: false,
                        },
                    }
                ],
                permissions: {
                    nesting: {
                        tokenOwner: true,
                        collectionAdmin: true,
                    }
                },
            };

            const {parsed, error} = await sdk.collection.creation.submitWaitResult(seedCollectionArgs);
            if (error) {
                console.log('create collection error', error);
                process.exit();
            }
            const {collectionId} = parsed;
            return sdk.collection.get({collectionId});
        }

        const collection = await createNestedCollection();
        console.log('seed collection', collection);
    }

    //seed balance
    const mint_seed = async (_type) => {
        const onetwowords = 'direct recall turtle kitchen frog planet fly power imitate fly nature quality';
        const signer = await KeyringProvider.fromMnemonic(onetwowords);
        console.log('address', signer.address);
        //Set properties
        const seedtokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '1',
            },
            encodedAttributes: {
                0: {_: 'seed'+_type},
            }
        }, SeedSchema);
        const seedTokenArgs = {
            address: _account.address,
            collectionId: 1620,
            properties: seedtokenProperties,
            name: 'Seed',
            description: 'Seed token for nesting',
        }
        const seedToken = await mintToken(sdk, seedTokenArgs);
        console.log('seed token: ', seedToken);
        const transferArgs = {
            address: _account.address,
            to: signer.address,
            collectionId: 1620,
            tokenId: seedToken.tokenId,
        }
        const seedowner = await transfer(sdk, transferArgs);
    }

    //Seed Collection
    const mintNnest_seed = async (_type) => {
        const onetwowords = 'direct recall turtle kitchen frog planet fly power imitate fly nature quality';
        const signer = await KeyringProvider.fromMnemonic(onetwowords);
        
        console.log('address', signer.address);
        //Set properties
        const seedtokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '1',
            },
            encodedAttributes: {
                0: {_: 'seed'+_type},
            }
        }, SeedSchema);

        const address = _account.address
        const seedTokenArgs = {
            address: _account.address,
            collectionId: 1617,
            properties: seedtokenProperties,
            name: 'Seed',
            description: 'Seed token for nesting',
            // data: {
            //     data: nestData.parentToken,
            //     image: {
            //         url: nestData.parentToken.image.url,
            //     }
            // }
        }
        const seedToken = await mintToken(sdk, seedTokenArgs);
        console.log('seed token: ', seedToken);
        // const args = {
        //     address: _account.address,
        //     to: signer.address,
        //     collectionId: 1617,
        //     tokenId: seedToken.tokenId,
        // }
        // const seed_owner = await transfer(sdk, args);
        const nested = await nestToken(sdk, {
            address,
            parent: {
                collectionId: 1619,
                tokenId: 2,
            },
            nested: {
                collectionId: 1617,
                tokenId: seedToken.tokenId,
            }
        });
        console.log('nest token', nested);
    }

    //Plant Collection
    const mintNnest_plant = async (_type) => {
        const onetwowords = 'direct recall turtle kitchen frog planet fly power imitate fly nature quality';
        const signer = await KeyringProvider.fromMnemonic(onetwowords);
        
        console.log('address', signer.address);
        //Set properties
        const seedtokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '1',
            },
            encodedAttributes: {
                0: {_: 'plant'+_type},
            }
        }, SeedSchema);

        const address = _account.address
        const seedTokenArgs = {
            address: _account.address,
            collectionId: 1617,
            properties: seedtokenProperties,
            name: 'Plant',
            description: 'Plant token for nesting',
            // data: {
            //     data: nestData.parentToken,
            //     image: {
            //         url: nestData.parentToken.image.url,
            //     }
            // }
        }
        const seedToken = await mintToken(sdk, seedTokenArgs);
        console.log('seed token: ', seedToken);
        // const args = {
        //     address: _account.address,
        //     to: signer.address,
        //     collectionId: 1617,
        //     tokenId: seedToken.tokenId,
        // }
        // const seed_owner = await transfer(sdk, args);
        const nested = await nestToken(sdk, {
            address,
            parent: {
                collectionId: 1619,
                tokenId: 2,
            },
            nested: {
                collectionId: 1617,
                tokenId: seedToken.tokenId,
            }
        });
        console.log('nest token', nested);
    }

    //Land Collection
    const unnest_seed = async () => {
        const onetwowords = 'direct recall turtle kitchen frog planet fly power imitate fly nature quality';
        const signer = await KeyringProvider.fromMnemonic(onetwowords);
        const address = signer.address;
        console.log('address', address);
        const baseUrl = 'https://rest.unique.network/opal/v1';
        function createSdk(account) {
            const options = {
                baseUrl,
                signer: account,
            }
            return new Sdk(options);
        }
        const owner_sdk = createSdk(signer);
        const token = await createUnNestedToken(owner_sdk, {
            address,
            parent: {
                collectionId: 1619,
                tokenId: 2,
            },
            nested: {
                collectionId: 1617,
                tokenId: 10,
            }
        })
        console.log('unnest token', token);
    }

    //Land Collection
    const burn_seed = async () => {
        const address = _account.address;
        const burnItemArgs = {
            tokenId: 2,
            collectionId: 1604,
            address: address,
        }

        const result = await burnToken(sdk, burnItemArgs);

        console.log(`burned token `, result);
    }

    //tool collection
    const tool_collection = async () => {
        async function createNestedCollection(){
            const toolCollectionArgs ={
                address: _account.address,
                name: 'Moon Farm Tool',
                description: 'MFT',
                tokenPrefix: 'MFT',
                schema: SeedSchema,
                tokenPropertyPermissions: [
                    {
                        key: 'a.0',
                        permission: {
                            tokenOwner: true,
                            collectionAdmin: true,
                            mutable: false,
                        },
                    }
                ],
                permissions: {
                    nesting: {
                        tokenOwner: true,
                        collectionAdmin: true,
                    }
                },
            };

            const {parsed, error} = await sdk.collection.creation.submitWaitResult(toolCollectionArgs);
            if (error) {
                console.log('create collection error', error);
                process.exit();
            }
            const {collectionId} = parsed;
            return sdk.collection.get({collectionId});
        }

        const collection = await createNestedCollection();
        console.log('tool collection', collection);
    }

    //tool collection
    const mintNnest_tool = async (_type) => {
        //Set properties
        const tooltokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '1',
            },
            encodedAttributes: {
                0: {_: 'tool'+_type},
            }
        }, SeedSchema);

        const address = _account.address
        const toolTokenArgs = {
            address: _account.address,
            collectionId: 1618,
            properties: tooltokenProperties,
            name: 'Tool',
            description: 'Tool token for nesting',
            // data: {
            //     data: nestData.parentToken,
            //     image: {
            //         url: nestData.parentToken.image.url,
            //     }
            // }
        }
        const toolToken = await mintToken(sdk, toolTokenArgs);
        console.log('tool token: ', toolToken);
        const nested = await nestToken(sdk, {
            address,
            parent: {
                collectionId: 1604,
                tokenId: 1,
            },
            nested: {
                collectionId: 1618,
                tokenId: toolToken.tokenId,
            }
        });
        console.log('nest token', nested);
    }

    //get land collection child
    const getchild = async () => {
        await waitReady();
        const args = {
            collectionId: 1604,
            tokenId: 1,
        };

        const result = await sdk.token.children(args);

        console.log(result);
    }

    //Crops Collection
    /*
    const Collection_Crops = async () => {

        try {
            //Args
            const collectionCreateArgs = {
                address: _account.address,
                name: 'CC',
                description: 'cc',
                tokenPrefix: 'CC',
                schema: CropsSchema,
                tokenPropertyPermissions: [
                    {
                        key: 'a.0',
                        permission: {
                            tokenOwner: true,
                            collectionAdmin: true,
                            mutable: false,
                        },
                    },
                ]
            };

            //Mint
            const res = await sdk.collection.creation.submitWaitResult(collectionCreateArgs);

            const { collectionId } = res.parsed;
            console.log(collectionId);

        } catch (err) {
            console.log('create collection error',err);
            process.exit();
        }
    }
    */

    const Fungible_CropAToken = async () => {
        const GameTokenCollectionArgs = {
            address: _account.address,
            name: 'mca',
            description: 'typea',
            tokenPrefix: 'MCA',
            decimals: 1,
        };

        const res = await sdk.fungible.createCollection.submitWaitResult(GameTokenCollectionArgs);

        const { collectionId } = res.parsed;
        console.log(collectionId);
    }

    const Fungible_CropBToken = async () => {
        const GameTokenCollectionArgs = {
            address: _account.address,
            name: 'mcb',
            description: 'typeb',
            tokenPrefix: 'MCB',
            decimals: 1,
        };

        const res = await sdk.fungible.createCollection.submitWaitResult(GameTokenCollectionArgs);

        const { collectionId } = res.parsed;
        console.log(collectionId);
    }

    //Fungible Token
    const Fungible_GameToken = async () => {
        const GameTokenCollectionArgs = {
            address: _account.address,
            name: 'mfc',
            description: 'mfc',
            tokenPrefix: 'MF',
            decimals: 10,
        };

        const res = await sdk.fungible.createCollection.submitWaitResult(GameTokenCollectionArgs);

        const { collectionId } = res.parsed;
        console.log(collectionId);
    }

    //Deploy
    const Deploy = async () => {
        //Farm, Seeds, Scarecrow, Auto-watering,Fertilize Collection
        //Collection_FSSAFC();

        //Crops Collection
        //Collection_Crops();
        await Fungible_CropAToken();
        await Fungible_CropBToken();

        //Fungible Token
        //Fungible_GameToken();
    }

    //BLOCKCHAIN_INTERACTION_FUNCTIONS
    //

    //Crops Collection
    const MintCropsCollection = async (_type) => {

        /*
        //Set properties
        const tokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '1',
            },
            encodedAttributes: {
                0: {_: ''+_type},
            }
        }, CropsSchema);

        //Mint
        try {
            const tokenMintResult = await sdk.token.create.submitWaitResult({
                address: _account.address,
                collectionId: 1472,
                //amount: 10,
                properties: tokenProperties,
                //recipient: address,
            });
    
            console.log(tokenMintResult.parsed.tokenId);

        } catch (err) {
            console.log('create token error', err);
        }
        */
    }

    //Game Token Collection
    const MintGameToken = async () => {
        const tokenArgs = {
            address: _account.address,
            collectionId: 1473,
            amount: 6,
            recipient: _account.address
        };

        const res = await sdk.fungible.addTokens.submitWaitResult(tokenArgs);
        
        //console.log(res);
        if (!res.error) {
            console.log('mint is completed?',res.isCompleted);
        } else {
            console.log(res.error.message);
        }
    }
    //Get Game Token Balance
    const getGameTokenBalance = async () => {
        const res = await sdk.fungible.getBalance({ collectionId: 1473, address: _account.address });
        //const res = await sdk.fungible.getBalance({ collectionId: 1473, address: '5EnCfZ1Y5FX3jVWb7CAm31kpJSoDjhqmk7zyzK7ZwvvJUKoD' });
        console.log('account balance:',res.amount);
    }
    //Transfer Game Token
    const transferGameToken = async () => {
        try {
            const transferArgs = {
                address: _account.address,
                collectionId: 1473,
                recipient: '5EnCfZ1Y5FX3jVWb7CAm31kpJSoDjhqmk7zyzK7ZwvvJUKoD',
                amount: 1.1,
            };

            const res = await sdk.fungible.transferTokens.submitWaitResult(transferArgs);

            //console.log(res);
            if (!res.error) {
                console.log('transaction is completed?',res.isCompleted);
            } else {
                console.log(res.error.message);
            }

        } catch (err) {
            console.log(err);
        }
    }

    //Bryant
    const CreateSeedCollection = async () => {
    const res = await sdk.collection.creation.submitWaitResult({
        address: _account.address,
        name: 'moon farm mulP seed',
        description: 'mul seed',
        tokenPrefix: 'MFMS',
        schema: NewSeedSchema,
        tokenPropertyPermissions: [
            {
                key: 'a.0', //type
                permission: {
                    mutable: true,
                    tokenOwner: true,
                    collectionAdmin: true,
                }
            },
            {
                key: 'a.1', //state
                permission: {
                    mutable: true,
                    tokenOwner: true,
                    collectionAdmin: true,
                }
            },
            {
                key: 'a.2', //last watering timestamp
                permission: {
                    mutable: true,
                    tokenOwner: true,
                    collectionAdmin: true,
                }
            },
            {
                key: 'a.3', //watering time left to nest state
                permission: {
                    mutable: true,
                    tokenOwner: true,
                    collectionAdmin: true,
                }
            }
        ]
    })
    console.log('colect:', res);
}
    const MintTool = async () => {
        await waitReady();
        //const signer = await KeyringProvider.fromMnemonic(mnemonic);
        const address = _account.address;
        //const sdk = createSdk(signer);

        //Set properties
        const seedtokenProperties = SchemaTools.encodeUnique.token({
            image: {
                urlInfix: '1',
            },
            encodedAttributes: {
                '0': {_: 'seedA'},
                '1': 0,
                '2': '',
                '3': 3,
            }
        }, SeedSchema);

        const toolTokenArgs = {
            address: address,
            owner: "5Ff3PNC3qLAVTAtU74DAyTQXrYFeZjtCp59SBiX4dXj3Cpfn",
            collectionId: 1638,
            properties: seedtokenProperties,
            name: 'Tool',
            description: 'Tool token for nesting',
        }
        const {parsed, error} = await sdk.token.create.submitWaitResult(toolTokenArgs);
        if (error) {
            console.log('create token error', error);
            process.exit();
        }
    
        const { tokenId } = parsed;
    
        const toolT = sdk.token.get({ collectionId: 1638, tokenId });
        console.log('token', toolT);
    }

    return(
        <>
            <button
                onClick={Deploy}
                className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                Deploy
            </button>

            <div className="Land Collection">
                <button
                    onClick={() => Collection_FSSAFC()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    Create Land Collection
                </button>
                <button
                    onClick={() => MintLand()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    Mint land token
                </button>
                <button
                    onClick={() => seed_collection()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    Create seed collection
                </button>
                <button
                    onClick={() => mint_seed('A')}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    mint seed balance
                </button>
                <button
                    onClick={() => mintNnest_seed(0)}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    Mint and nest seed token
                </button>
                <button
                    onClick={() => unnest_seed()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    unnest
                </button>
                <button
                    onClick={() => burn_seed()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    burn
                </button>
            </div>
            <div className="Tool Collection">
                <button
                    onClick={() => tool_collection()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    create tool collection
                </button>
                <button
                    onClick={() => mintNnest_tool()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    mint tool
                </button>
                <button
                    onClick={() => getchild()}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    get child
                </button>
                <button
                    onClick={() => mintNnest_plant('A')}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                    Mint and nest plant
                </button>
            </div>

            <div className='Crop Collection'>
                <button
                    onClick={() => MintCropsCollection(0)}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Mint Crops Collection Type-0
                </button>
                <button
                    onClick={() => MintCropsCollection(1)}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Mint Crops Collection Type-1
                </button>
            </div>

            <div className='Game Token'>
                <button
                    onClick={MintGameToken}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Mint Game Token: 6
                </button>
                <button
                    onClick={getGameTokenBalance}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Get Account Balance
                </button>
                <button
                    onClick={transferGameToken}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Transfer Token
                </button>
                <button
                    onClick={CreateSeedCollection}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Bryant Collection
                </button>
                <button
                    onClick={MintTool}
                    className='btn btn:hover duration-150 delay-50 dark:focus:ring-offset-gray-800'>
                        Bryant Mint
                </button>
            </div>
        </>
    )
}
export default CollectionDeployment;

//Schemas

//CropsSchema
const CropsSchema = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
    schemaVersion: '1.0.0',
    image: {urlTemplate: 'https://ipfs.unique.network/ipfs/QmcAcH4F9HYQtpqKHxBFwGvkfKb8qckXj2YWUrcc8yd24G/image{infix}.png'},
    coverPicture: {urlInfix: '0'},

    attributesSchemaVersion: '1.0.0',
    attributesSchema: {
        0: {
            name: {_: "c"},
            type: AttributeType.string,
            optional: true,
            isArray: false,
        },
    }
}

//SeedSchema
const SeedSchema = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
    schemaVersion: '1.0.0',
    image: {urlTemplate: 'https://ipfs.unique.network/ipfs/QmcAcH4F9HYQtpqKHxBFwGvkfKb8qckXj2YWUrcc8yd24G/image{infix}.png'},
    coverPicture: {urlInfix: '0'},

    attributesSchemaVersion: '1.0.0',
    attributesSchema: {
        0: {
            name: {_: "S"},
            type: AttributeType.string,
            optional: true,
            isArray: false,
        },
    }
}


//Bryant
const NewSeedSchema = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
    schemaVersion: '1.0.0',
    image: {urlTemplate: 'https://ipfs.unique.network/ipfs/QmcAcH4F9HYQtpqKHxBFwGvkfKb8qckXj2YWUrcc8yd24G/image{infix}.png'},
    coverPicture: {urlInfix: '0'},

    attributesSchemaVersion: '1.0.0',
    attributesSchema: {
        0: {
            name: {_: 'attr1'},
            type: AttributeType.string,
            optional: true,
            isArray: false,
        }
    }

}