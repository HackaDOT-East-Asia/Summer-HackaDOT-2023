import { useState, useEffect } from 'react';
import { createUnNestedToken } from '../utils/Game';
import { burnToken } from '../utils/Game';
import { LandQuery } from "./Query/LandQuery";


export const Shovel_confirm = ({sdk, signer, id}) => {
    //Query States
    const [landLastRes, setLandLastRes] = useState(null);
    const address = signer.address;
    const confirm_destory = async() => {
        //get land id
        const land_id = id;

        //get seed id nested inside land
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
        // console.log('shovel seed id', seed_id);

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

        //burn seed
        const burnArgs = {
            tokenId: seed_id,
            collectionId: 1639,
            address: address,
        }
        const result = await burnToken(sdk, burnArgs);
        // console.log('burned!', result);
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
                onClick={confirm_destory}>
                    Confirm
            </button>
        </div>
        </>
    )
}