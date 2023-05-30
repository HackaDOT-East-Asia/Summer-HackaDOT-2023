import { useEffect, useState } from "react";

import { ERC721Camera } from "./components/ERC721Camera";
import bunzz from "bunzz-sdk";
import {Web3Provider} from "./components/providers/web3Provider";

const App = () => {

  useEffect(() => {
  }, [])

  return (
    <Web3Provider>
      <div className="center">
        <div>
          <ERC721Camera/>
        </div>
      </div>
    </Web3Provider>
  );
};

export default App;
