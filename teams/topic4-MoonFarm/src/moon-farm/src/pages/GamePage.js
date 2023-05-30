import React, { useRef, useEffect, useState } from 'react';
import bgImgSrc from './imgs/bg.png';
import grassImgSrc from './imgs/grass.png';
import farmImgSrc from './imgs/farm.png';
import seedA0 from './imgs/seedA/A0png.png';
import seedA1 from './imgs/seedA/A1gif.gif';
import seedA2 from './imgs/seedA/A2gif.gif';
import seedB0 from './imgs/seedB/B0png.png';
import seedB1 from './imgs/seedB/B1gif.gif';
import seedB2 from './imgs/seedB/B2gif.gif';
import testwater from './imgs/props/test water.gif';
import scarecrow from './imgs/props/scarecrow.png';

import { useNavigate } from 'react-router-dom';

//components
import { TokenTitle } from "../components/TokenTitle";
import { Market } from "../components/Market";

import { TileMenu } from '../components/TileMenu';

//utils
import { getGameTokenBalance, mintGameToken, transferGameToken } from "../utils/GameToken";
import { mintCrops } from '../utils/CropsCollection';

//Queries
import { LandQuery } from "../components/Query/LandQuery"
import { ClassifyComponent } from '../components/SDK/ClassifyComponent';

//Land Collection
const LAND_COLLECTION_ID = 1619;
//Seed Collection
const SEED_COLLECTION_ID = 1639;
//Tool Collection
const ITEMS_COLLECTION_ID = 1618;
//Crops Token
const CROP_A = 1611;
const CROP_B = 1612;
//Game Token
const GAME_TOKEN_COLLECTION_ID = 1473;

// Land [id1, id2, id3, id4, id5, id6]
// Seed [seed of id1, seed of id2, ... , seed of id6]
// Item [item of id1, item of id2, ... , item of id6]

const GamePage = ({sdk, signer}) => {
    //MapGenerator(signer={signer});
    // Map
    //* *START************************************************** */
    //
    //States
    const [landLastRes, setLandLastRes] = useState(null);
    const [lands, setLands] = useState([]);
    const [children, setChildren] = useState([]);
    const [seeds, setSeeds] = useState([]); // a0/a1/a2  b0/b1/b2
    const [itemS, setItemS] = useState([]);  // scarecrow
    const [itemW, setItemW] = useState([]);  // watering

    const map = [];
    //compare with the fetched land
    for (let i=0; i<6; i++) {
        if (i<lands.length) {
            map.push(lands[i]);

        }
        else {
            map.push(-1);
        }
    }

    //?
    const fetchChildComponent = async (_map) => {

        let _children = [];
        for (let i=0; i<_map.length; i++) {
            if (_map[i] !== -1) {
                //using sdk to find its children
                const childrenArgs = {
                    collectionId: LAND_COLLECTION_ID,
                    tokenId: _map[i],
                    // tokenId: 2,
                }
                const res = await sdk.token.children(childrenArgs);

                if (res.children.length !== 0) {
                    //console.log('Y Children: ',res.children);

                    _children.push(res.children);
                    console.log('hi: ',res.children);
                    /*
                    let _seeds = [];
                    let _items = [];
                    for (let i=0; i<res.children.length; i++) {
                        let child = res.children[i];
                        if (child.collectionId === SEED_COLLECTION_ID) { //is seed
                            _seeds.push(child.tokenId);
                        } else if (child.collectionId === ITEMS_COLLECTION_ID) {//is item
                            //check its type (Scarecrow / Auto-Watering )
                            const itemTypeArgs = {
                                collectionId: ITEMS_COLLECTION_ID,
                                tokenId: child.collectionId,
                            };
                            const res = await sdk.token.properties(itemTypeArgs);
                            console.log('tool: ', res.properties[0].value);
                        }
                    }
                    */

                } else {
                    //console.log('F Children: ',res.children);
                    _children.push(-1);
                }
            }
            setChildren(_children);
            //return true;
            
        }
        //console.log('child: ',_children);
        

        
    }


    const classifyChildComponent = async (_children) => {
        for (let i=0; i<6; i++) {
            //console.log('child: ('+i+') ',_children);

            
            //
            let hv_seed = false;
            let hv_tool_S = false;
            let hv_tool_W
            let _seeds = [];
            let _item_s = [];
            let _item_w = [];
            let seed_A = false;
            let seed_B = false;
            let seed_state = -1;
            for (let j=0; j<_children.length; j++) {
                let child = _children[j];
                if (child.collectionId === SEED_COLLECTION_ID) { //is seed
                    //check seed type
                    hv_seed = true;
                    const propertyArgs = {
                        collectionId: 1639,
                        tokenId: _children.tokenId,
                        propertyKeys: ['a.0'],
                    }
                    const properties_result = await sdk.token.properties(propertyArgs);
                    if (properties_result.properties[0].value=='{"_":"seedA"}') {
                        seed_A = true;
                    }else if(properties_result.properties[0].value=='{"_":"seedB"}') {
                        seed_B = true;
                    }
                    //check seed state
                    const stateArgs = {
                        collectionId: 1639,
                        tokenId: _children.tokenId,
                        propertyKeys: ['a.0'],
                    }
                    const state_result = await sdk.token.properties(stateArgs);
                    seed_state = state_result.properties[0].value;
                    //put seed type into state [] ('A' / 'B' / '0')
                    if(seed_A) {
                        setSeeds('A'+seed_state);
                        // _seeds.push('A'+seed_state);
                    }else if (seed_B){
                        setSeeds('B'+seed_state);
                        // _seeds.push('B'+seed_state);
                    }
                    // _seeds.push(child.tokenId);
                } else if (child.collectionId === ITEMS_COLLECTION_ID) {//is item
                    //check tool type
                    const propertyArgs = {
                        collectionId: 1618,
                        tokenId: _children.tokenId,
                        propertyKeys: ['a.0'],
                    }
                    const properties_result = await sdk.token.properties(propertyArgs);
                    if (properties_result.properties[0].value=='{"_":"toolS"}') {
                        hv_tool_S = true;
                    }else if(properties_result.properties[0].value=='{"_":"toolW"}') {
                        hv_tool_W = true;
                    }
                    /*
                    //check its type (Scarecrow / Auto-Watering )
                    const itemTypeArgs = {
                        collectionId: ITEMS_COLLECTION_ID,
                        tokenId: child.collectionId,
                    };
                    const res = await sdk.token.properties(itemTypeArgs);
                    console.log('tool: ', res.properties[0].value);
                    */
                }
            }
            if(!hv_seed) {
                // no seed on this land
                setSeeds('0'+seed_state);
            }
            if(hv_tool_S) {
                setItemS(true);
                // _item_s.push(true);
            }else{
                setItemS(false);
                // _item_s.push(false);
            }
            if(hv_tool_W) {
                setItemW(true);
                // _item_w.push(true);
            }else{
                setItemW(false);
                // _item_w.push(false);
            }
            console.log('seed array', seeds);
            console.log('item S array', itemS);
            console.log('item W array', itemW);
            // setSeeds(_seeds);
            // setItemS(_item_s);
            // setItemW(_item_w);
        }
    }

    //#fetch land collection
    let landCurrentRes = LandQuery(signer);
    console.log(landCurrentRes);
    if (landCurrentRes !== landLastRes) {
        setLandLastRes(landCurrentRes);
        //console.log(landCurrentRes);
        for (let i=0; i<landCurrentRes.length; i++) {
            lands.push(landCurrentRes[i].token_id);
        }
        console.log('land array: ',lands);
        fetchChildComponent(map)
        //classify type
        classifyChildComponent(children);
    }

    /* *END****************************************************** */
    //Page History Hook
    const navigate = useNavigate();

    //States
    const [currentTile, setCurrentTile] = useState(null);

    //show all farms [MAX 6]
    const canvasRef = useRef(null);
    
    //const map = ['F','F','F',
    //            'F','F','F',];
    

    //fetch children
            //const childrenArgs = { collectionId: LAND_COLLECTION_ID, token_id: lands[i].token_id }
            //const res = await sdk.token.children(childrenArgs);
            //console.log('children: ',res);

    const rows = 2;
    const cols = 3;

    //Functions
    function isPointInPolygon(point, polygon) {
        let inside = false;
        for (let i=0; i<polygon.length; i++) {
            let j = (i === 0) ? polygon.length - 1 : i -1;

            const xi = polygon[i].x, yi = polygon[i].y;
            const xj = polygon[j].x, yj = polygon[j].y;

            const intersect = ((yi > point.y) !== (yj > point.y))
                && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    }


    

    useEffect(()=> {
        
        //fetch children
            if (!map) {
                fetchChildComponent(map)
                //classify type
                classifyChildComponent(children);
                console.log('fetch map map')
            }
        

        //RENDER
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        //canvas dimensions
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        //load images
        const bgImg = new Image();
        bgImg.src = bgImgSrc;

        const grassImg = new Image();
        grassImg.src = grassImgSrc;

        const farmImg = new Image();
        farmImg.src = farmImgSrc;

        const seedA0Img = new Image();
        seedA0Img.src = seedA0;

        const seedA1Img = new Image();
        seedA1Img.src = seedA1;

        const seedA2Img = new Image();
        seedA2Img.src = seedA2;

        const seedB0Img = new Image();
        seedB0Img.src = seedB0;

        const seedB1Img = new Image();
        seedB1Img.src = seedB1;

        const seedB2Img = new Image();
        seedB2Img.src = seedB2;

        const waterImg = new Image();
        waterImg.src = testwater;
        const scarecrowImg = new Image();
        scarecrowImg.src = scarecrow;

        //tiles setting
        //to-do
        const TILE_WIDTH = 1 + 1.153;
        const TILE_HEIGHT = 1.151;

        //render map
        bgImg.onload = () => {
            //draw bg
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            grassImg.onload = () => {
                farmImg.onload =() => {
                    //pre-cal
                    //resize
                    const scaledWidth = TILE_WIDTH * (25);
                    const scaledHeight = TILE_HEIGHT * (35);

                    //total map dimension
                    const totalMapWidth = cols * scaledWidth;
                    const totalMapHeight = rows * scaledHeight;

                    //calculate offset
                    const offsetX = (canvasWidth - totalMapWidth) / 2 - (3);
                    const offsetY = (canvasHeight - totalMapHeight) / 2 + (8);


                    for(let i=0; i<map.length; i++) {
                    
                        const img = map[i]===-1 ? grassImg : farmImg;

                        //cal
                        const cartX = i % cols;
                        const cartY = Math.floor(i / cols);
                    
                        //convert to iso
                        const isoX = cartX * scaledWidth * (0.915);
                        const isoY = cartY * scaledHeight * (0.576);

                        //draw
                        ctx.drawImage(img, isoX+offsetX, isoY+offsetY, scaledWidth, scaledHeight);
                        if(seeds != "0-1"){
                            seedA0Img.onload = () => {
                                seedA1Img.onload = () => {
                                    seedA2Img.onload = () => {
                                        seedB0Img.onload = () => {
                                            seedB1Img.onload = () => {
                                                seedB2Img.onload = () => {
                                                    let seed_img;
                                                    // if(seeds == "A0"){
                                                    //     seed_img = seedA0Img;
                                                    // }else if(seeds == "A1"){
                                                    //     seed_img = seedA1Img;
                                                    // }else if(seeds == "A2"){
                                                    //     seed_img = seedA2Img;
                                                    // }else if(seeds == "B0"){
                                                    //     seed_img = seedB0Img;
                                                    // }else if(seeds == "B1"){
                                                    //     seed_img = seedB1Img;
                                                    // }else if(seeds == "B2"){
                                                    //     seed_img = seedB2Img;
                                                    // }else{
                                                    //     //no seed
                                                    // }
                                                    seed_img = seedA1Img;
                                                    ctx.drawImage(seed_img, isoX+offsetX, isoY+offsetY, scaledWidth, scaledHeight);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        // if(itemW){
                            waterImg.onload = () => {
                                ctx.drawImage(waterImg, isoX+offsetX, isoY+offsetY, scaledWidth, scaledHeight);
                            }
                        // }
                        // if(itemS){
                            scarecrowImg.onload = () => {
                                ctx.drawImage(scarecrowImg, isoX+offsetX, isoY+offsetY, scaledWidth, scaledHeight);
                            }
                        // }
                        console.log('seed on this land', seeds);
                        console.log('toll s on this land', itemS);
                        console.log('tool w on this land', itemW);
                    }

                    //
                    const clickHandler = function(event) {
                        const rect = canvas.getBoundingClientRect();
                        const x = event.clientX - rect.left;
                        const y = event.clientY - rect.top;
                        console.log(x+'|'+y);

                        /*
                        //adjust click coordinates match the tile's center point
                        const correctedX = x - offsetX;
                        const correctedY = y - offsetY;
                        console.log('offsetX',offsetX);
                        console.log('offsetY',offsetY);
                        console.log('correctedX',correctedX);
                        console.log('correctedY',correctedY);

                        //1. adjust click coordinates
                        const adjustedX = x - offsetX;
                        const adjustedY = y - offsetY;
                        console.log('adjustedX: ',adjustedX);
                        console.log('adjustedY: ',adjustedY);

                        //2. convert to isometric space
                        const tileX = (adjustedX / scaledWidth - adjustedY / scaledHeight) / 2;
                        const tileY = (adjustedY / scaledHeight - adjustedX / scaledWidth) / 2;
                        console.log('tileX: ',tileX);
                        console.log('tileY: ',tileY);

                        //3. round
                        const tileIndexX = Math.round(tileX);
                        const tileIndexY = Math.round(tileY);
                        console.log('tileIndexX: ',tileIndexX);
                        console.log('tileIndexY: ',tileIndexY);

                        //output
                        const tileIndex = tileIndexY * cols + tileIndexX;

                        console.log('tileIndex: ',tileIndex);
                        console.log('***********');
                        */

                        //[HARD]
                        const areas = [
                            [ 
                                {x: 412.5, y: 252},
                                {x: 495.5, y: 297},
                                {x: 398.5, y: 351},
                                {x: 309.5, y: 303}
                            ],
                            [ 
                                {x: 621.5, y: 251},
                                {x: 704.5, y: 297},
                                {x: 607.5, y: 351},
                                {x: 516.5, y: 303}
                            ],
                            [ 
                                {x: 830.5, y: 251},
                                {x: 914.5, y: 297},
                                {x: 816.5, y: 351},
                                {x: 724.5, y: 303}
                            ],
                            [ 
                                {x: 412.5, y: 363},
                                {x: 495.5, y: 408},
                                {x: 398.5, y: 460},
                                {x: 309.5, y: 413}
                            ],
                            [ 
                                {x: 621.5, y: 363},
                                {x: 704.5, y: 408},
                                {x: 607.5, y: 460},
                                {x: 516.5, y: 413}
                            ],
                            [ 
                                {x: 830.5, y: 363},
                                {x: 914.5, y: 408},
                                {x: 816.5, y: 460},
                                {x: 724.5, y: 413}
                            ],
                        ];

                        //HARD CAL
                        for (let i=0; i<areas.length; i++) {
                            if (isPointInPolygon({x, y}, areas[i])) {
                                console.log('clicked tile: ',i);
                                setCurrentTile(i);
                                break;
                            }
                        }

                    };
                    canvas.addEventListener('click', clickHandler);

                    return () => {
                        canvas.removeEventListener('click', clickHandler);
                    };
                }
            }
        }
    }, [sdk, signer, map])
    return(
        <div>
            <h1 className="text-6xl font-bold text-amber-400 text-left px-5">Moon Farm Game</h1>
            <h2 className="text-2xl mt-1 text-white text-left px-5 dark:text-white">Address: {signer.address}</h2>
            <button
                onClick={() => navigate('/')}
                className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                Return Home
            </button>

            <div style={{
                position: 'relative',
                display: 'flex',
                justifyContent:'center',
                alignItems: 'center',
                height: '100%'}}>
                    <div style={{position: 'relative', width: '1280px', height: '720px'}}className='mx-auto border-4 border-black'>
                        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}/>

                        <div style={{position: 'absolute', top: '10px', right: '10px', zIndex: '2'}}>
                            <TokenTitle sdk={sdk} signer={signer} collectionId={GAME_TOKEN_COLLECTION_ID}/>
                        </div>
                        <div style={{position: 'absolute', top: '30px', right: '10px', zIndex: '2'}}>
                            <Market sdk={sdk} signer={signer} />
                        </div>
                    </div>

                    {currentTile !== null &&
                        <div style={{position: 'absolute',
                            width: '55%',
                            height: '55%',
                            backgroundColor: 'rgba(0,0,0,0.5',
                            zIndex: '2',
                            display: 'flex',
                            justifyContent:'center',
                            alignItems: 'center'}}>

                                <div style={{position: 'relative', zIndex: '3'}}>
                                    <TileMenu
                                        sdk={sdk}
                                        signer={signer}
                                        tile={currentTile}
                                        id={lands[currentTile]}
                                        onClose={() => setCurrentTile(null)}
                                    />
                                </div>

                    </div>}
            </div>

            <div>
                <button
                    onClick={() => mintCrops(CROP_A, signer, 1)}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                        Mint Crop-Type-0
                </button>
                <button
                    onClick={() => mintCrops(CROP_B, signer, 1)}
                    className='btn btn:hover delay-50 duration-150 dark:focus:ring-offset-gray-800'>
                        Mint Crop-Type-1
                </button>
            </div>

        </div>
    )
}
export default GamePage;