import { createUnNestedToken } from '../utils/Game';
import { burnToken } from '../utils/Game';
import { mintCrops } from "../utils/CropsCollection";
import { LandQuery } from "./Query/LandQuery";
import { useState, useEffect } from 'react';

export const Harvest_plant = ({sdk, signer, tile}) => {
    //Query States
    const [landLastRes, setLandLastRes] = useState(null);
    const address = signer.address;

    const getPlantType = async (sdk, address, current_land) => {
        //get land id
        // console.log('land query', landCurrentRes);
        const landId = landCurrentRes[tile].token_id;
        // console.log('land query id', landId);
        const childArgs = {
            collectionId: 1619,
            tokenId: landId,
        };

        const child_result = await sdk.token.children(childArgs);
        // console.log('child result: ',child_result);
        for(let i=0; i<child_result.children.length;i++){
            //if in seed collection
            if(child_result.children[i].collectionId==1639){
                //if property is plant
                const propertyArgs = {
                    collectionId: 1639,
                    tokenId: child_result.children[i].tokenId,
                    propertyKeys: ['a.0'],
                }
                const properties_result = await sdk.token.properties(propertyArgs);
                // console.log('get property');
                if (properties_result.properties[0].value=='{"_":"plantA"}') {    
                    // console.log('plantA');
                    return true;
                }else if(properties_result.properties[0].value=='{"_":"plantB"}') {
                    // console.log('plantB');
                    return false;
                }
            }
        }
    }

    const confirm_harvest = async() => {
        
        //get land id
        // console.log('land query', landCurrentRes);
        const land_id = landCurrentRes[tile].token_id;
        
        // get plant id nested inside land
        const childArgs = {
            collectionId: 1619,
            tokenId: land_id,
        };
        let seed_id;
        const land_children = await sdk.token.children(childArgs);
        // console.log('land children', land_children);
        for(let i=0; i<land_children.children.length; i++){
            if(land_children.children[i].collectionId==1639){
                seed_id = land_children.children[i].tokenId;
            }
        }
        // console.log('seed id', seed_id);

        //get plant type from property
        const plant_type = await getPlantType(sdk, address, tile);
        //add crops
        let crop_type;
        if(plant_type){
            crop_type = 1611;
            // console.log('crop 1611')
        }else{
            crop_type = 1612;
            // console.log('crop 1612')
        }

        //unnest from seed collection
        const unnest_token = await createUnNestedToken(sdk, {
            address,
            parent: {
                collectionId: 1619,
                tokenId: land_id,
            },
            nested: {
                collectionId: 1639,
                tokenId: seed_id,
            }
        })
        // console.log('unnest token', unnest_token);
        //burn plant
        const burnArgs = {
            tokenId: seed_id,
            collectionId: 1639,
            address: address,
        }
        const result = await burnToken(sdk, burnArgs);
        // console.log('burned!', result);
        
        await mintCrops(crop_type, signer, 1);
    }

    //#fetch land collection
    let landCurrentRes = LandQuery(signer);
    console.log(landCurrentRes);
    if (landCurrentRes !== landLastRes) {
        setLandLastRes(landCurrentRes);
    }

    return(
        <>
        <div>
            <button
                onClick={onclose}>
                    Cancel
            </button>
            <button
                onClick={confirm_harvest}>
                    Confirm
            </button>
        </div>
        </>
    )
}