import { LandQuery } from "./Query/LandQuery";
import { useState, useEffect } from 'react';
import { AttributeType, COLLECTION_SCHEMA_NAME, SchemaTools } from "@unique-nft/schemas";
import { mintToken, nestToken } from "../utils/Game";
import { KeyringProvider } from "@unique-nft/accounts/keyring";
import Sdk from '@unique-nft/sdk';
import { waitReady } from "@polkadot/wasm-crypto";

export const ItemShop = ({sdk, signer, id}) => {
    //Query States
    const [landLastRes, setLandLastRes] = useState(null);

    const checkTool = async (toolType) => {
        //get land id
        const landId = id;

        //get land child with col 1618
        const childArgs = {
            collectionId: 1619,
            tokenId: landId,
        };
        console.log('landid check', landId);
        const child_result = await sdk.token.children(childArgs);
        // console.log('child result: ',child_result);
        for (let i=0; i<child_result.children.length; i++){
            if(child_result.children[i].collectionId==1618){
                //if token exist check property
                const propertyArgs = {
                    collectionId: 1618,
                    tokenId: child_result.children[i].tokenId,
                    propertyKeys: ['a.0'],
                }
                const properties_result = await sdk.token.properties(propertyArgs);
                // console.log('get property');
                if (properties_result.properties[0].value=='{"_":"tool'+toolType+'"}') {    
                    console.log('toolS');
                    return true;
                }else if(properties_result.properties[0].value=='{"_":"toolW"}') {
                    console.log('toolW');
                    return false;
                }
                //if property found, return true else false
            }
        }
        console.log('no tool');
        return false;
    }

    const baseUrl = 'https://rest.unique.network/opal/v1';
    function createSdk(account) {
        const options = {
            baseUrl,
            signer: account,
        }
        return new Sdk(options);
    }

    //Functions
    const BuyScarecrow = async () => {
        await waitReady();
        const owner_mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
        const owner_account = await KeyringProvider.fromMnemonic(owner_mnemonic);
        const owner_address = owner_account.address;
        const owner_sdk = createSdk(owner_account);
        //check if tool is already bought
        const haveTool = await checkTool('S');
        console.log('tool boolean:',haveTool);
        //if not bought, mint new tool
        if(haveTool){
            console.log('Scarecrow exist in this tile');
        }else{//mint
            //get land id
            const landId = id;
            // console.log('query land id', landId);
            //Set properties
            const tooltokenProperties = SchemaTools.encodeUnique.token({
                image: {
                    urlInfix: '1',
                },
                encodedAttributes: {
                    0: {_: 'toolS'},
                }
            }, SeedSchema);

            const toolTokenArgs = {
                address: owner_address,
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
            const toolToken = await mintToken(owner_sdk, toolTokenArgs);
            // console.log('tool token: ', toolToken);
            // console.log('nest land id', landId);
            // console.log('nest tool token', toolToken.tokenId);
            const nested = await nestToken(owner_sdk, {
                address: owner_address,
                parent: {
                    collectionId: 1619,
                    tokenId: landId,
                },
                nested: {
                    collectionId: 1618,
                    tokenId: toolToken.tokenId,
                }
            });
            // console.log('nest token', nested);
            // console.log('mint scarecrow');
        }
        console.log('Buy scarecrow', id);
    }

    const BuyAutoWatering = async () => {
        const owner_mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
        const owner_account = await KeyringProvider.fromMnemonic(owner_mnemonic);
        const owner_address = owner_account.address;
        const owner_sdk = createSdk(owner_account);
        //check if tool is already bought
        const haveTool = await checkTool('W');
        //if not bought, mint new tool
        if(haveTool){
            console.log('Auto-watering exist in this tile');
        }else{
            //mint
            //get land id
            const landId = id;
            //Set properties
            const tooltokenProperties = SchemaTools.encodeUnique.token({
                image: {
                    urlInfix: '1',
                },
                encodedAttributes: {
                    0: {_: 'toolW'},
                }
            }, SeedSchema);

            const toolTokenArgs = {
                address: owner_address,
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
            const toolToken = await mintToken(owner_sdk, toolTokenArgs);
            // console.log('tool token: ', toolToken);
            // console.log('nest land id', landId);
            // console.log('nest tool token', toolToken.tokenId);
            const nested = await nestToken(owner_sdk, {
                address: owner_address,
                parent: {
                    collectionId: 1619,
                    tokenId: landId,
                },
                nested: {
                    collectionId: 1618,
                    tokenId: toolToken.tokenId,
                }
            });
            // console.log('nest token', nested);
            // console.log('mint watering');
        }
        // console.log('Buy auto-watering', tile);
    }

    //#fetch land collection
    let landCurrentRes = LandQuery(signer);
    console.log(landCurrentRes);
    if (landCurrentRes !== landLastRes) {
        setLandLastRes(landCurrentRes);
        console.log('land id check', id);
    }

    return(
        <>
        <div>
            <div>
                <h1>Scarecrow</h1>
                <button
                    onClick={BuyScarecrow}>
                        Buy
                </button>
            </div>
            <div>
                <h1>Auto-watering</h1>
                <button
                    onClick={BuyAutoWatering}>
                        Buy
                </button>
            </div>
        </div>
        </>
    )
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