//Flow
//
//i. get sdk get signer
//ii. check its owned farmlands and record all tokenIds
//iii. check its child components
//iv. check does the child components exist seed collection?
//  if existed,
//      a. save & check its type
//      b. save & check its state
//
//v. check does the child components exist item collection?
//  if existed,
//      save & check its type (scarescrow / auto-watering)

//output all saved map arrays
// Land [id1, id2, id3, id4, id5, id6]
// Seed [seed of id1, seed of id2, ... , seed of id6]
// Item [item of id1, item of id2, ... , item of id6]

//
import { useState, useEffect } from 'react';
//Queries
import { LandQuery } from "./Query/LandQuery"

export const MapGenerator = ({signer}) => {
    //States
    const [landLastRes, setLandLastRes] = useState(null);

    //Output States
    const [lands, setLands] = useState([]);
    const [seeds, setSeeds] = useState([]);
    const [item, setItems] = useState([]);

    //#fetch land collection
    let landCurrentRes = LandQuery(signer);
    console.log(landCurrentRes);
    if (landCurrentRes !== landLastRes) {
        setLandLastRes(landCurrentRes);

        //for (landCurrentRes.)
        console.log(landCurrentRes);
    }

}