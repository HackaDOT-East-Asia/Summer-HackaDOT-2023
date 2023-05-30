import { useEffect, useState } from "react";

//utils
import { getGameTokenBalance } from "../utils/GameToken";

//token text
export const TokenTitle = ({sdk, signer, collectionId}) => {
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        const interval = setInterval(async () => {

            //Get Balance
            const newBal = await getGameTokenBalance(sdk, collectionId, signer.address);
            setBalance(newBal);
            console.log('set',newBal);

        }, 3000);

        return () => clearInterval(interval);
    }, [sdk, signer, collectionId]);
    return (
        <>
            <h1 className="text-5xl pt-4 pr-4 text-white">Token: {balance}</h1>
        </>
    )
}