/**
 * 定数を定義するファイル
 */
export const BLOCKCHAINS = [
    {
      name: 'Astar',
      url: 'wss://astar.api.onfinality.io/public-ws',
      subscan_url: 'https://astar.subscan.io/account/',
    },
    {
      name: 'Shiden', 
      url: 'wss://shiden.api.onfinality.io/public-ws',
      subscan_url: 'https://shiden.subscan.io/account/',
    },
    {
      name: 'Shibuya',
      url: 'wss://rpc.shibuya.astar.network',
      subscan_url: 'https://shibuya.subscan.io/account/',
    },
    {
      name: 'Local',
      url: 'ws://127.0.0.1:9944',
    },
    {
      name: 'Custom',
      url: '',
      //url: 'wss://astar-collator.cielo.works:11443',
    },
];

export const TWITTER_URL = "https://twitter.com/HARUKI05758694";
// 各コントラクトのアドレス(Local Network)
// export const WASM_NFT_CONTRACT_ADDRESS = "";
// export const ASTAR_NFT_CONTRACT_ADDRESS = "";
// export const SHIDEN_NFT_CONTRACT_ADDRESS = "";
// export const CONTENT_CONTRACT_ADDRESS = "";

// 各コントラクトのアドレス(Shibuya Network)
export const WASM_NFT_CONTRACT_ADDRESS = "ZjCB8QVKytLmGRGXVCHCuUMnMiQTWU2V3696zqnQiD9kjMg";
export const ASTAR_NFT_CONTRACT_ADDRESS = "a6WkJRaZcy6cVkvRQmRmd1TVhAc1Dfq3d7cmpGUjjn9736d";
export const SHIDEN_NFT_CONTRACT_ADDRESS = "bezTq8fCqsG6X49e1KRmeVcatNWNaSHfNM218iHzFKPTxsk";
export const CONTENT_CONTRACT_ADDRESS = "av5MGBmkEMfKVfQerD1yjDBcQ1hkgu9GoaMN7DkeAMq4nyP";

// 各コントラクトのアドレス(Shiden Network)
//export const WASM_NFT_CONTRACT_ADDRESS = "YT4pXMbzftUFcjwH1yMtpB9yvgkJMbYboPyRsCYSD7pgqMa";
//export const ASTAR_NFT_CONTRACT_ADDRESS = "betwgtAMMVsLG3tZqDhUcQJ1TthvBkwowotAWyCGgcn9cgE";
//export const SHIDEN_NFT_CONTRACT_ADDRESS = "XNvt8RqjUSd8CZy2dvHS9GhhWjDBEtrPaqxC7fDwMCSzBaY";
//export const CONTENT_CONTRACT_ADDRESS = "";

// 各コントラクトのアドレス(Astar Network)
//export const WASM_NFT_CONTRACT_ADDRESS = "";
//export const ASTAR_NFT_CONTRACT_ADDRESS = "";
//export const SHIDEN_NFT_CONTRACT_ADDRESS = "";
//export const CONTENT_CONTRACT_ADDRESS = "";