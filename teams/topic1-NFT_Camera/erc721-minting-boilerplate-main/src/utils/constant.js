const NETWORK_LIST = {
    astar: {
        chainName: "Astar Network",
        chainIdHex: "0x250",
        chainId: 592,
        RPC: "https://evm.astar.network" + process.env.REACT_APP_INFURA_KEY,
        contracts: {
            ERC721URIStorage: " "
        }
    }
}

export const CHAIN_INFO = NETWORK_LIST[process.env.REACT_APP_NETWORK];
