import { useState, useEffect } from 'react';
//componenets
import { SelectSeed } from '../components/SelectSeed';
import { Watering } from '../components/Watering';
import { ItemShop } from '../components/ItemShop';
import { Shovel_confirm } from '../components/Shovel_confirm'
import { Harvest_plant } from '../components/Harvest'
import { LandQuery } from "./Query/LandQuery";

export const TileMenu = ({ sdk, signer, tile, id, onClose }) => {

    //States
    const [isPlanting, setIsPlanting] = useState(false);
    const [isWatering, setWatering] = useState(false);
    const [isOpenItemShop, setIsOpenItemShop] = useState(false);
    const [isShovel, setShovel] = useState(false);
    const [isHarvest, setHarvest] = useState(false);
    //Query States
    const [landLastRes, setLandLastRes] = useState(null);

    const checkLandisEmpty = async () => {
        //get land id
        //const landId = landCurrentRes[tile].token_id;

        //get land children
        const childArgs = {
            collectionId: 1619,
            tokenId: id,
        };
        const child_result = await sdk.token.children(childArgs);
        for(let i=0; i<child_result.children.length;i++){
            if(child_result.children[i].collectionId==1639){
                console.log('there is seed on land');
                return false;
            }
        }
        return true;
    }

    //Functions
    const plant = async () => {
        // console.log('in plant function');
        //check if land isEmpty()
        const isEmpty = await checkLandisEmpty();
        //select seed to plant if owned
        if(isEmpty){
            setIsPlanting(true);
        }
        
    }
    const watering = async () => {
        //if has the auto-watering item -> reject
        const isEmpty = await checkLandisEmpty();
        if(!isEmpty){
            setWatering(true);
        }
    }
    const ItemsShop = async () => {
        //pop up another items shop window
        setIsOpenItemShop(true);
    }

    const Shovel = async () => {
        //pop up a confirmation window
        console.log('in shovel function');
        const isEmpty = await checkLandisEmpty();
        if(!isEmpty){
            setShovel(true);
        }
    }

    const Harvest = async () => {
        //calculate the correct amount of receiving crops
        console.log('in harveset function');
        const isEmpty = await checkLandisEmpty();
        if(!isEmpty){
            setHarvest(true);
        }
    }

    //#fetch land collection
    let landCurrentRes = LandQuery(signer);
    console.log(landCurrentRes);
    if (landCurrentRes !== landLastRes) {
        setLandLastRes(landCurrentRes);
    }

    return (
        <div className='modal bg-orange-800 divide-y-4 divide-yellow-400 divide-opacity-25 md:divide-y-8'>
            <h2 className="py-2 text-5xl text-white">Tile {tile}</h2>
            <h2 className="py-2 text-3xl text-white">Token Id: {id} </h2>
            
            {id && (<>
            <div className='is planting'>
                {isPlanting && 
                    <div>
                        <SelectSeed
                            sdk={sdk}
                            signer={signer}
                            id={id} />
                        &nbsp;
                        <br/>
                        <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                            onClick={() => setIsPlanting(false)}>
                            Close
                        </button>
                    </div>}
            </div>
            
            <div className='is watering'>
                {isWatering && 
                    <div>
                        <Watering
                            sdk={sdk}
                            signer={signer}
                            id={id} />
                        &nbsp;
                        <br/>
                        <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                            onClick={() => setWatering(false)}>
                            Close
                        </button>
                    </div>}
            </div>

            <div className='is item shop'>
                {isOpenItemShop && 
                    <div>
                        <ItemShop
                            sdk={sdk}
                            signer={signer}
                            id={id} />
                        &nbsp;
                        <br/>
                        <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                            onClick={() => setIsOpenItemShop(false)}>
                            Close
                        </button>
                    </div>}
            </div>

            <div className='shovel'>
                {isShovel && 
                    <div>
                        <Shovel_confirm
                            sdk={sdk}
                            signer={signer}
                            id={id} />
                        &nbsp;
                        <br/>
                        <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                            onClick={() => setShovel(false)}>
                            Close
                        </button>
                    </div>}
            </div>

            <div className='harvest'>
                {isHarvest && 
                    <div>
                        <Harvest_plant
                            sdk={sdk}
                            signer={signer}
                            id={id} />
                        &nbsp;
                        <br/>
                        <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                            onClick={() => setHarvest(false)}>
                            Close
                        </button>
                    </div>}
            </div>

            {!(isPlanting || isOpenItemShop || isShovel || isHarvest) && 
            <div className='button gp'>
            <button 
                onClick={plant}
                className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-amber-400 shadow-lg shadow-amber-400/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-amber-600">
                    Plant
            </button>
            &nbsp;
            <button 
                onClick={watering}
                className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-amber-400 shadow-lg shadow-amber-400/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-amber-600">
                    Watering
            </button>
            &nbsp;
            <button 
                onClick={() => setIsOpenItemShop(true)}
                className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-amber-400 shadow-lg shadow-amber-400/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-amber-600">
                    Items Shop
            </button>
            &nbsp;
            <button
                onClick={Shovel}
                className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-amber-400 shadow-lg shadow-amber-400/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-amber-600">
                Shovel
            </button>
            &nbsp;
            <button
                onClick={Harvest}
                className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-amber-400 shadow-lg shadow-amber-400/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-amber-600">
                Harvest
            </button>
            &nbsp;
            <br/>
            <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                onClick={onClose}>
                    Close
            </button>
            </div>
            }
        </>)}

        {!id && (<>
            <h2 className="py-2 text-5xl text-white">Please Purchase the land.</h2>
            <button className="text-2xl mt-3 py-3 px-4 inline-flex justify-center items-center gap-2 rounded-md border border-transparent font-semibold bg-rose-600 shadow-lg shadow-rose-600/50 text-white focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 hover:-translate-y-1 hover:scale-110 hover:bg-rose-600"
                onClick={onClose}>
                    Close
            </button>
        </>)}

        </div>
    );
};