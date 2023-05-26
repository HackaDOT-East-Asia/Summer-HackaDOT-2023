import { useEffect, useState, useContext } from "react";
import Link from "next/link";
import SelectAccount from "../../components/SelectAccount";
import FlipState from "../../components/FlipState";

const Home = () => {
  const [showSelectAccount, setShowSelectAccount] = useState(false);

  const checkSelectedAccount = () => {
    let address = sessionStorage.getItem("selected_account_address");
    console.log("## address: ",address);
    if (address == "" || address == null) {
      setShowSelectAccount(true);
    }
  };

  useEffect(() => {
    checkSelectedAccount();
  }, []);

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="text-center text-100px font-extrabold leading-none tracking-tight">
          <div className="p-3"></div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-blue-500">
            Example:DAO Flip By DAO Oriented Protocol
          </span>
        </div>
        {/* {showSelectAccount ? (
          <>
            <SelectAccount
              setShowAccount={setShowSelectAccount}
            ></SelectAccount>
          </>
        ) : (
          <> */}
            <div className="p-1 text-center text-25px">
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="../software">Softwares</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="../members">Members</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="../proposals">Proposals</Link>
              </button>
              <button className="m-5 px-7 py-3 border-double border-white border-2 bg-black rounded text-white  hover:border-orange-500">
                <Link href="../elections">Result Of Elections</Link>
              </button>
              <FlipState></FlipState>
            </div>
          {/* </>
        )} */}
      </div>
    </>
  );
};
export default Home;