import { useState, useEffect } from 'react';

//Apollo GraphQL
import { useQuery, gql } from '@apollo/client';

//utils
import { getCropsBalance } from '../utils/CropsCollection';
import { sellCrops, buySeed, buyLand } from '../utils/Game';
import { getGameTokenBalance } from '../utils/GameToken';
//
import { SeedQuery } from './Query/SeedQuery';
import { LandQuery } from './Query/LandQuery';

const GAME_TOKEN_COLLECTION_ID = 1473;

const SEED_COLLECTION = 1639;

export const Market = ({sdk, signer ,bal}) => {
    //States
    const [isOpen, setOpen] = useState(false);
    const [isSellingCropA, setSellingCropA] = useState(false);
    const [isSellingCropB, setSellingCropB] = useState(false);
    
    const [inputValue, setInputValue] = useState("");

    const [cropABalance, setCropABalance] = useState(null);
    const [cropBBalance, setCropBBalance] = useState(null);

    //land States
    const [landBalance, setLandBalance] = useState(null);

    //seed States
    const [isBuyingSeedA, setBuyingSeedA] = useState(false);
    const [isBuyingSeedB, setBuyingSeedB] = useState(false);

    const [seedABalance, setSeedABalance] = useState(null);
    const [seedBBalance, setSeedBBalance] = useState(null);

    //Query States
    const [seedLastRes, setSeedLastRes] = useState(null);
    const [landLastRes, setLandLastRes] = useState(null);

    //FUNCTIONS
    const openMarket = () => {
        setOpen(true);
        //update
        //refetch({ ownerAddress: signer.address });
    }
    //sell bt
    const handleSellSubmit = (e) => {
        e.preventDefault();

        let typeString = "";
        let amount = 0;
        if (isSellingCropA) {
            typeString="A";
            amount = 3;
        }
        else {
            typeString="B";
            amount = 5;
        }

        let totalReceivedAmount = inputValue * amount;

        //console.log('Crop: '+typeString+' | submitted value: ',inputValue, ' | receiving amount: ',totalReceivedAmount);

        //Sell logic
        //check balance
        //sell it
        //if success && no error
        //mint token && destroy crops

        if (isSellingCropA) {


            if (inputValue <= cropABalance) {
                //sell logic
                sellCrops(sdk, signer, 0, inputValue);
            } else {
                alert('Not enough crops');
            }

        } else {
            if (inputValue <= cropBBalance) {
                //sell logic
                sellCrops(sdk, signer, 1, inputValue);
            } else {
                alert('Not enough crops');
            }

        }
    };

    const handleInputChange = (e) => {
        setInputValue(e.target.value);
    }

    //Buy Seeds
    const BuySeed = async (_type) => {
        let price = 0;
        if (_type === 'A' ) {
            price = 1;
        } else {
            price = 3;
        }

        //Get Balance
        const newBal = await getGameTokenBalance(sdk, GAME_TOKEN_COLLECTION_ID, signer.address);

        if (price > 0) {
            if ( price <= newBal) {
                await buySeed(sdk, signer, _type, price);
            } else if (price > newBal) {
                alert('Not enough Moon Farm Coin.');
            }
        } else {
            alert('Invalid Input.');
        }
    }
    const handleBuySubmit = async (e) => {
        e.preventDefault();

        let type = 'A';
        let sumPrice = 0;
        if (isBuyingSeedA) {
            type = 'A';
            sumPrice = inputValue * 1;
        }
        else {
            type = 'B';
            sumPrice = inputValue * 3;
        }

        //Get Balance
        const newBal = await getGameTokenBalance(sdk, GAME_TOKEN_COLLECTION_ID, signer.address);

        if (sumPrice > 0) {
            if ( sumPrice <= newBal) {
                buySeed(sdk, signer, type, inputValue, sumPrice);
            } else if (sumPrice > newBal) {
                alert('Not enough Moon Farm Coin.');
            } 
        } else {
            alert('Invalid Input.');
        }
    };

    //Buy Lands
    const onBuyLand = async () => {
        console.log('Buy Land');

        //flow:
        //check land max?
        //check game token balance
        //mint land
        if (landBalance < 6) {

            //Check & Get Balance
            const newBal = await getGameTokenBalance(sdk, GAME_TOKEN_COLLECTION_ID, signer.address);
            if ( newBal >= 10 ) {
                //buyland
                await buyLand(sdk, signer, 10);
            } else {
                    alert('Not enough Moon Farm Coin.');
            }
            
        } else
            alert('Land Max: 6.');
    }

    //
    useEffect(() => {
        const interval = setInterval(async () => {

            const {cropABal, cropBBal} = await getCropsBalance(sdk, signer.address);
            //Get Balance
            //Crop A
            //const cropABal = await getCropsBalance(sdk, signer.address);
            //setCropABalance(totalCropAToken.length);
            setCropABalance(cropABal);
            //Crop B
            //const cropBBal = await getCropsBalance(sdk, signer.address);
            //setCropBBalance(totalCropBToken.length);
            setCropBBalance(cropBBal);
            
        }, 3000);

        return () => clearInterval(interval);
    }, [sdk, signer])

    //Apollo GraphQL
    //#fetch seed collection
    let seedCurrentRes = SeedQuery(signer);
    //console.log(seedCurrentRes);
    if (seedCurrentRes !== seedLastRes) {
        setSeedLastRes(seedCurrentRes);

        //check A and B type balance
        let seedAbal = 0;
        let seedBbal = 0;
        for (let i=0; i<seedCurrentRes.length; i++) {
            if (seedCurrentRes[i].properties[0].value==='{"_":"seedA"}') {
                seedAbal++;
                //console.log('SEED A', i);
            } else if (seedCurrentRes[i].properties[0].value==='{"_":"seedB"}') {
                seedBbal++;
                //console.log('SEED B', i);
            }
        }

        //
        if (seedAbal !== seedABalance)
            setSeedABalance(seedAbal);
        //
        if (seedBbal !== seedBBalance)
            setSeedBBalance(seedBbal);
    }
    //#fetch land collection
    let landCurrentRes = LandQuery(signer);
    //console.log(landCurrentRes);
    if (landCurrentRes !== landLastRes) {
        setLandLastRes(landCurrentRes);

        //count
        //console.log('land bal inside: ',landCurrentRes.length);
        setLandBalance(landCurrentRes.length);
    }
    //console.log('land bal: ',landBalance);

    return(
        <>
            {!isOpen && 
                <button onClick={openMarket} className="text-5xl pt-10 pr-4 text-white">Market</button>
            }

            {(isOpen && !(isSellingCropA || isSellingCropB || isBuyingSeedA || isBuyingSeedB))&& (
                <div className='bg-orange-800 divide-y-4 divide-yellow-400 divide-opacity-25 p-8 rouned shadow md:divide-y-8'>

                    <div>
                        <div>
                            <h1 className="h1">Crop A IMG</h1>
                            <h1>balance: {cropABalance}</h1>
                            <button onClick={() => setSellingCropA(true)} className="btn-amber">
                                Sell Crop A
                            </button>
                        </div>

                        <div>
                            <h1 className="h1">Crop B IMG</h1>
                            <h1>balance: {cropBBalance}</h1>
                            <button onClick={() => setSellingCropB(true)} className="btn-amber">
                                Sell Crop B
                            </button>
                        </div>
                    </div>

                    <div>
                        <div>
                            <h1 className="h1">Seed A IMG</h1>
                            <h1>balance: {seedABalance}</h1>
                            <button onClick={() => BuySeed('A')} className="btn-amber">
                                Buy Seed A
                            </button>
                        </div>

                        <div>
                            <h1 className="h1">Seed B IMG</h1>
                            <h1>balance: {seedBBalance}</h1>
                            <button onClick={() => BuySeed('B')} className="btn-amber">
                                Buy Seed B
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <h1 className="h1">Land IMG</h1>
                        <h1>Price: 10 Moon Farm Coin</h1>
                        <h1>{landBalance}/6</h1>
                        <button onClick={() => onBuyLand()} className="btn-amber">
                                Buy Land
                        </button>
                    </div>

                <button onClick={() => setOpen(false)} className="btn-rose">
                    Back
                </button>
                </div>
            )}

            {isSellingCropA && (
                <div className='bg-orange-800 divide-y-4 divide-yellow-400 divide-opacity-25 p-8 rouned shadow md:divide-y-8'>
                    <h1 className="h1">Sell Crop A</h1>
                    <form onSubmit={handleSellSubmit}>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            className='input'
                            placeholder="Enter amount"
                        />
                        &nbsp;
                        <button type='submit' className='btn-amber'>
                            Sell
                        </button>
                    </form>
                    <button onClick={() => setSellingCropA(false)} className="btn-rose">
                        Back
                    </button>
                </div>
            )}
            {isSellingCropB && (
                <div className='bg-orange-800 divide-y-4 divide-yellow-400 divide-opacity-25 p-8 rouned shadow md:divide-y-8'>
                    <h1 className="h1">Sell Crop B</h1>
                    <form onSubmit={handleSellSubmit}>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            className='input'
                            placeholder="Enter amount"
                        />
                        &nbsp;
                        <button type='submit' className='btn-amber'>
                            Sell
                        </button>
                    </form>
                    <button onClick={() => setSellingCropB(false)} className="btn-rose">
                        Back
                    </button>
                </div>
            )}

            {isBuyingSeedA && (
                <div className='bg-orange-800 divide-y-4 divide-yellow-400 divide-opacity-25 p-8 rouned shadow md:divide-y-8'>
                    <h1 className="h1">Buy Seed A</h1>

                    <form onSubmit={handleBuySubmit}>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            className='input'
                            placeholder="Enter amount"
                        />
                        &nbsp;
                        <button type='submit' className='btn-amber'>
                            Buy
                        </button>
                    </form>

                    <button onClick={() => setBuyingSeedA(false)} className="btn-rose">
                        Back
                    </button>
                </div>
            )}

            {isBuyingSeedB && (
                <div className='bg-orange-800 divide-y-4 divide-yellow-400 divide-opacity-25 p-8 rouned shadow md:divide-y-8'>
                    <h1 className="h1">Buy Seed B</h1>
                    <form onSubmit={handleBuySubmit}>
                        <input
                            type="number"
                            value={inputValue}
                            onChange={handleInputChange}
                            className='input'
                            placeholder="Enter amount"
                        />
                        &nbsp;
                        <button type='submit' className='btn-amber'>
                            Buy
                        </button>
                    </form>
                    <button onClick={() => setBuyingSeedB(false)} className="btn-rose">
                        Back
                    </button>
                </div>
            )}
        </>
    )
}