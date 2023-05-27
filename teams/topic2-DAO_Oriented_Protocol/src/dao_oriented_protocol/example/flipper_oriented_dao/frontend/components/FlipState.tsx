import { useContext, useEffect, useState } from "react";
import { getFlipState } from "../api/getFlip";
import { AppContext } from "../pages/_app";
import { get_selected_address } from "../api/accountInfoUtils";
import { checkAndCreateApiObject } from "../api/apiUtils";

const FlipState = () => {
	const [showFlip,setShowFlip] = useState("");

	const {api, setApi} = useContext(AppContext);
	
	const getFlipValue = async () => {
    await checkAndCreateApiObject(api, setApi);
		const selectedAddress = get_selected_address();
		const value = await getFlipState(api, selectedAddress);
		setShowFlip(value);
	}

	useEffect(() => {
		getFlipValue();
	}, []);
	  
  return (
    <>
      <div className="text-center text-100px font-extrabold leading-none tracking-tight">
        <div className="p-3"></div>
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-500">
          {showFlip}
        </span>
      </div>
    </>
  );
};

export default FlipState;
