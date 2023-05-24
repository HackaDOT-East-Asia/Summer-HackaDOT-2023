import { 
    createContext, 
    useContext, 
    useState, 
} from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { 
    BLOCKCHAINS,
    WASM_NFT_CONTRACT_ADDRESS,
    ASTAR_NFT_CONTRACT_ADDRESS,
    SHIDEN_NFT_CONTRACT_ADDRESS,
    CONTENT_CONTRACT_ADDRESS
} from '../components/common/Constant';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import type { WeightV2 } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';
import { useRouter } from 'next/router';

// Specify the metadata of the contract.
import wasmNftAbi from '../metadata/nft.json';
import wasmContentAbi from '../metadata/content.json';

// NFT用のデータ型
export type NftInfo = {
    name: string | undefined;
    image: string | undefined;
    description:string | undefined;
};

// Content data type
export type ContentInfo = {
    content_id: Number;
    title: string;
    intro: string;
    content: string;
    goods: Number;
    statement: string;
    quizs: string[];
    answer: Number;
    image_url: string;
    nft_address: string;
    creator_address: string;
}

// contextから渡すデータ型
export type ContextType = {
    connectWallet: () => Promise<void>;
    actingAddress: string;
    isLoading: Boolean;
    nftInfos: NftInfo[];
    contentInfos: ContentInfo[];
    mint: (contentFlg: string) => Promise<void>;
    good: () => Promise<void>;
    quiz: () => Promise<void>;
    cheer: () => Promise<void>;
};

const proofSize = 131072
const refTime = 9219235328
const storageDepositLimit = null

// Create Context Object
const ContractContext = createContext({});

/**
 * useContractContext function
 * @returns 
 */
export function useContractContext() {
    return useContext(ContractContext);
}

/**
 * ContractProvider Compnent
 * @param param0 
 * @returns 
 */
export function ContractProvider({ children }: any) {
    // ステート変数
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [actingAddress, setActingAddress] = useState('');
    // 接続するネットワークは、ここで切り替える。
    const [blockchainName, setBlockchainName] = useState('Shibuya');
    const [blockchainUrl, setBlockchainUrl] = useState('');
    const [api, setApi] = useState<any>();
    const [block, setBlock] = useState(0);
    const [ownNfts, setOwnNfts] = useState('');
    const [nftInfos, setNftInfos] = useState<NftInfo[]>([]);
    const [contentInfos, setContentInfos] = useState<ContentInfo[]>([])
    const [width, setWidth] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    
    /**
     * createNftContract function
     * @param contentFlg コンテンツフラグ
     */
    const createNftContract = async(contentFlg: string) => {
        var contract;
        const contentId: number = Number(contentFlg);
        
        //Get nftAddress from Content Contract
        const contentDataForContentId :any= await getContentInfo(api, contentId);//contentIdに対応したデータを取得
        const nftAddress :string = contentDataForContentId.nftAddress; //NFTのコントラクトアドレスを取得
        console.log("[createNftContract] nftAddress: ", nftAddress);
        contract = new ContractPromise(api, wasmNftAbi, nftAddress);

        return contract;
    };

    /**
     * createContentContract function
     */
    const createContentContract = (api: any) => {
        var contract = new ContractPromise(api, wasmContentAbi, CONTENT_CONTRACT_ADDRESS);
        return contract;
    };

    /**
     * getNftAddress function
     */
    const getNftAddress = (contentFlg: string) => {
        var address;

        if(contentFlg === 'wasm'){
            address = WASM_NFT_CONTRACT_ADDRESS;
        } else if(contentFlg === 'astar') {
            address = ASTAR_NFT_CONTRACT_ADDRESS;
        } else {
            address = SHIDEN_NFT_CONTRACT_ADDRESS;
        }
        return address;
    };

    /**
     * connectWallet function
     * @returns 
     */
    const connectWallet = async () => {
        const { web3Accounts, web3Enable } = await import("@polkadot/extension-dapp");
        const extensions = await web3Enable("Learning Astar Dapp");

        if (extensions.length === 0) {
            return;
        }

        setIsLoading(true);
        // get Account info
        const account = await web3Accounts();
        setAccounts(account);

        if (!actingAddress) {
            setActingAddress(account[0].address);
        }

        const newDataset = BLOCKCHAINS.filter(data => data.name === blockchainName);

        let chainUrl = newDataset[0]?.url;
        setBlockchainUrl(chainUrl);

        if (!chainUrl) {
            return;
        }

        setBlock(0);
        // ブロックチェーンにアクセスするためのオブジェクトを作成
        const wsProvider = new WsProvider(chainUrl);
        const api = await ApiPromise.create({
            provider: wsProvider
        });
        // call subscribeNewHeads
        const unsubscribe = await api.rpc.chain.subscribeNewHeads((lastHeader) => {
            setApi(api);
            setBlock(lastHeader.number.toNumber());
            unsubscribe();
        });

        // get owned NFTs 
        await getNftInfos(api, account[0].address);
        // get content infos
        await getContentInfos(api).then(() => setIsLoading(false));
    };

    /**
     * getNftInfos function
     */
    const getNftInfos = async(api: any, address: string) => {
        // NFTの残高をチェックする
        let balanceOf = await checkBalanceOf(api, 'wasm',address);
        let balanceOf2 = await checkBalanceOf(api, 'astar',address);
        let balanceOf3 = await checkBalanceOf(api, 'shiden',address);

        let nfts:NftInfo[] = [];

        if (balanceOf > 0) {
            let nftInfo = await getInfo(api, 'wasm');
            nfts.push(nftInfo); 
        }
        if (balanceOf2 > 0) {
            let nftInfo2 = await getInfo(api, 'astar');
            nfts.push(nftInfo2);
        }
        if (balanceOf3 > 0) {
            let nftInfo3 = await getInfo(api, 'shiden');
            nfts.push(nftInfo3);            
        }

        console.log("nftInfos:", nfts);
        setNftInfos(nfts);
    };

    /**
     * good function
     * @param contentFlg コンテンツフラグ
     * @returns 
     */
    const good = async(contentFlg: string) => {
        //コンテンツコントラクトでcontentIdごと保持するgoodsの値を、加算する

        const { web3FromSource } = await import('@polkadot/extension-dapp');
    
        // get content object
        var contract = createContentContract(api);
        //contentFlgを文字列型から数値に変換しておく
        const contentId: number = Number(contentFlg);

        console.log("[good] give good to contentId: ", contentId);
        setIsLoading(true);

        const gasLimit: any = api.registry.createType("WeightV2", {
            refTime: new BN("10000000000"),
            proofSize: new BN("10000000000"),
        });

        // ガス代などを取得する。
        const { 
            gasRequired, 
            gasConsumed ,
            result, 
            output 
        } = await contract.query.addGood(
            actingAddress,
            { 
                value: 0, 
                gasLimit: gasLimit,storageDepositLimit 
            }, contentId
        );
        
        const addGoodExtrinsic = await contract.tx.addGood({ value: 0, gasLimit: gasRequired }, contentId);
      
        let injector: any;

        if (accounts.length == 1) {
            injector = await web3FromSource(accounts[0].meta.source);
        } else if (accounts.length > 1) {
            injector = await web3FromSource(accounts[0].meta.source);
        } else {
            return;
        }
      
        addGoodExtrinsic.signAndSend(actingAddress, { signer: injector.signer }, ({ status }) => {
            if (status.isInBlock) {
                console.log(`Completed at block hash #${status.asInBlock.toString()}`);
            } else if (status.isFinalized) {
                console.log('finalized');
                alert("AddGood Success!!");
                setIsLoading(false);
            } else {
                console.log(`Current status: ${status.type}`);
            }
        }).catch((error: any) => {
            console.log(':( transaction failed', error);
            alert("AddGood fail...");
            setIsLoading(false);
        });

        return;
    };

    /**
     * quiz function
     * @param contentFlg コンテンツフラグ
     * @returns 
     */
    const quiz = async() => {
        alert("Quiz!");
        return;
    };

    /**
     * cheer function
     * @param contentFlg コンテンツフラグ
     * @returns 
     */
    const cheer = async(contentFlg: string) => {
        setIsLoading(true);

        const { web3FromSource } = await import('@polkadot/extension-dapp');

        let injector: any;

        if (accounts.length == 1) {
            injector = await web3FromSource(accounts[0].meta.source);
        } else if (accounts.length > 1) {
            injector = await web3FromSource(accounts[0].meta.source);
        } else {
            return;
        }

        console.log("injector", injector);
        console.log("accounts", injector.accounts);
        console.log("signer", injector.signer);
        console.log("signer.address", actingAddress);

        const wsProvider = new WsProvider(blockchainUrl);
        const api = await ApiPromise.create({
            provider: wsProvider
        });
        //Get Distination Address from Content Contract
        const contentId :number = Number(contentFlg); //contentIDを数値に変換
        const contentDataForContentId :any= await getContentInfo(api, contentId);//contentIdに対応したデータを取得
        console.log("[cheer] contentDataForContentId: ", contentDataForContentId)
        const distAddress :string = contentDataForContentId.creatorAddress;
        console.log("[cheer] distAddress: ", distAddress);


        // transfer 0.0001d ASTAR
        api.tx.balances
            .transfer(distAddress, 100000000000000)
            .signAndSend(actingAddress, { signer: injector.signer }, 
                (status) => { 
                    console.log("status", status); 
                    if(status.isFinalized) {
                        alert("transaction success!! ");
                        setIsLoading(false);
                    }
                }).catch((error: any) => {
                    console.log(':( transaction failed', error);
                    alert("transaction fail...");
                    setIsLoading(false);
                });


        return;
    };

    /**
     * get content info method
     */
    const getContentInfos = async(api: any) => {
        // get content object
        var contract = createContentContract(api);

        // call getNftName メソッド
        const {result, output} = 
            await contract.query.getContents(
                CONTENT_CONTRACT_ADDRESS,
                {
                    gasLimit: api.registry.createType('WeightV2', {
                        refTime,
                        proofSize,
                    }) as WeightV2,
                    storageDepositLimit,
                },);

        // check if the call was successful
        console.log("get contents ...", result);
        if (result.isOk) {
            const outputData: any = output;
            // json形式にして再び取得する。
            const jsonData = JSON.parse(outputData.toString());
            console.log(`contents info: ${JSON.stringify(jsonData.ok)}`);
            let list:any = [];
            jsonData.ok.map( (e:any) => {
              console.log("content", e);
              let content: ContentInfo = {
                content_id: e.contentId,
                title: e.title,
                intro: e.intro,
                content: e.content,
                goods: e.goods,
                statement: e.statement,
                quizs: e.quizs,
                answer: e.answer,
                image_url: e.imageUrl,
                nft_address: e.nftAddress,
                creator_address: e.creatorAddress
              };
              list.push(content);
            });
            setContentInfos(list);

        } else {
            console.error('get content error: ', result);
        }
    };

    /**
     * get content info method
     * @param contentId コンテンツID
     */
    const getContentInfo = async(api: any, contentId: number) => {
        //指定したcontentIdに対応したコンテンツデータを取得する
        // get content object
        var contract = createContentContract(api);

        const {result, output} = 
            await contract.query.getContent(
                CONTENT_CONTRACT_ADDRESS,
                {
                    gasLimit: api.registry.createType('WeightV2', {
                        refTime,
                        proofSize,
                    }) as WeightV2,
                    storageDepositLimit,
                },contentId);

        // check if the call was successful
        if (result.isOk) {
            const outputData: any = output;
            // json形式にして再び取得する。
            const jsonData = JSON.parse(outputData.toString());
            // console.log('[getContentInfo]contentId: ', contentId);
            // console.log(`[getContentInfo]content info: ${JSON.stringify(jsonData.ok)}`);
            return jsonData.ok;
        } else {
            console.error('error');
        }

    };

    /**
     * mint function
     * @param contentFlg コンテンツフラグ
     * @returns 
     */
    const mint = async(contentFlg: string) => {

        const { web3FromSource } = await import('@polkadot/extension-dapp');

        if (!blockchainUrl || accounts.length == 0) {
            alert("Please Connect Wallet");
            return;
        }
          
        // コントラクトインスタンスを格納する変数
        var contract = await createNftContract(contentFlg);
       
        console.log("nft contract:", contract);
        setIsLoading(true);

        const gasLimit: any = api.registry.createType("WeightV2", {
            refTime: new BN("10000000000"),
            proofSize: new BN("10000000000"),
        });

        // ガス代などを取得する。
        const { 
            gasRequired, 
            gasConsumed ,
            result, 
            output 
        } = await contract.query.mintNft(
            actingAddress,
            { 
                value: 0, 
                gasLimit: gasLimit,storageDepositLimit 
            },
        );
        // NFTをミントする。
        const mintExtrinsic = await contract.tx.mintNft({ value: 0, gasLimit: gasRequired },);
      
        let injector: any;

        if (accounts.length == 1) {
            injector = await web3FromSource(accounts[0].meta.source);
        } else if (accounts.length > 1) {
            injector = await web3FromSource(accounts[0].meta.source);
        } else {
            return;
        }
      
        mintExtrinsic.signAndSend(actingAddress, { signer: injector.signer }, ({ status }) => {
            if (status.isInBlock) {
                console.log(`Completed at block hash #${status.asInBlock.toString()}`);
            } else if (status.isFinalized) {
                console.log('finalized');
                alert("Mint Success!!");
                setIsLoading(false);
                // redirect to NFT page
                router.push('/nfts');
            } else {
                console.log(`Current status: ${status.type}`);
            }
        }).catch((error: any) => {
            console.log(':( transaction failed', error);
            alert("Mint fail...");
            setIsLoading(false);
        });
    };

    /**
     * checkBalanceOf function
     * @param api APIオブジェクト
     * @param contentFlg コンテンツフラグ
     * @param address 残高を確認したいアドレス
     */
    const checkBalanceOf = async(api:any, contentFlg: string, address: string): Promise<number> => {
        // コントラクトインスタンスとアドレスを格納する変数
        var contract;
        var contractAddress = getNftAddress(contentFlg);

        if(contentFlg === 'wasm'){
            contract = new ContractPromise(api, wasmNftAbi, WASM_NFT_CONTRACT_ADDRESS);
        } else if(contentFlg === 'astar') {
            contract = new ContractPromise(api, wasmNftAbi, ASTAR_NFT_CONTRACT_ADDRESS);
        } else {
            contract = new ContractPromise(api, wasmNftAbi, SHIDEN_NFT_CONTRACT_ADDRESS);
        }

        // ガス代を計算
        const gasLimit: any = api.registry.createType("WeightV2", {
            refTime: new BN("10000000000"),
            proofSize: new BN("20000000000"),
        });

        // call psp34::balanceOf メソッド
        const {result, output} = 
            await contract.query['psp34::balanceOf'](
                address,
                { value: 0, gasLimit: gasLimit,storageDepositLimit },
                address);

        // The actual result from RPC as `ContractExecResult`
        console.log(result.toHuman());

        // check if the call was successful
        if (result.isOk) {
            const outputData: any = output;
            console.log('own nft count:', outputData.toString());
            return Number(outputData.toString());
        } else {
            return 0;
        }
    }

    /**
     * getInfo function
     * @param api APIオブジェクト
     * @param contentFlg コンテンツフラグ
     * @returns own nft's id
     */
    const getInfo = async(api:any, contentFlg: string) => {
        
        // call getNftName メソッド
        const name = await getNftName(api, contentFlg);
        // call getNftImage メソッド
        const image = await getNftImage(api, contentFlg);
        // call getNftDescription メソッド
        const discription = await getNftDecription(api, contentFlg);
        
        // NFTの情報を格納する変数
        let nftInfo: NftInfo = {
            name: name,
            image: image,
            description: discription,
        };

        return nftInfo;
    };

    /**
     * getNftName
     * @param api APIオブジェクト
     * @param contentFlg コンテンツフラグ
     */
    const getNftName = async(api: any, contentFlg: string) => {
        // コントラクトインスタンスとアドレスを格納する変数
        var contract;
        var contractAddress = getNftAddress(contentFlg);

        if(contentFlg === 'wasm'){
            contract = new ContractPromise(api, wasmNftAbi, WASM_NFT_CONTRACT_ADDRESS);
        } else if(contentFlg === 'astar') {
            contract = new ContractPromise(api, wasmNftAbi, ASTAR_NFT_CONTRACT_ADDRESS);
        } else {
            contract = new ContractPromise(api, wasmNftAbi, SHIDEN_NFT_CONTRACT_ADDRESS);
        }

        // call getNftName メソッド
        const {result, output} = 
            await contract.query.getNftName(
                contractAddress,
                {
                    gasLimit: api.registry.createType('WeightV2', {
                        refTime,
                        proofSize,
                    }) as WeightV2,
                    storageDepositLimit,
                },);

        // check if the call was successful
        if (result.isOk) {
            const outputData: any = output;
            // json形式にして再び取得する。
            const jsonData = JSON.parse(outputData.toString());
            const name:string = jsonData.ok;
            return name;
        } else {
            console.error('error');
        }
    };

    /**
     * getNftImage
     * @param api APIオブジェクト
     * @param contentFlg コンテンツフラグ
     */
    const getNftImage = async(api: any, contentFlg: string) => {
        // コントラクトインスタンスとアドレスを格納する変数
        var contract;
        var contractAddress = getNftAddress(contentFlg);

        if(contentFlg === 'wasm'){
            contract = new ContractPromise(api, wasmNftAbi, WASM_NFT_CONTRACT_ADDRESS);
        } else if(contentFlg === 'astar') {
            contract = new ContractPromise(api, wasmNftAbi, ASTAR_NFT_CONTRACT_ADDRESS);
        } else {
            contract = new ContractPromise(api, wasmNftAbi, SHIDEN_NFT_CONTRACT_ADDRESS);
        }

        // call getNftName メソッド
        const {result, output} = 
            await contract.query.getIamge(
                contractAddress,
                {
                    gasLimit: api.registry.createType('WeightV2', {
                        refTime,
                        proofSize,
                    }) as WeightV2,
                    storageDepositLimit,
                },);

        // check if the call was successful
        if (result.isOk) {
            const outputData: any = output;
            // json形式にして再び取得する。
            const jsonData = JSON.parse(outputData.toString());
            const image:string = jsonData.ok;
            return image;
        } else {
            console.error('error');
        }
    };

    /**
     * getNftDecription
     * @param api APIオブジェクト
     * @param contentFlg コンテンツフラグ
     */
    const getNftDecription = async(api: any, contentFlg: string) => {
        // コントラクトインスタンスとアドレスを格納する変数
        var contract;
        var contractAddress = getNftAddress(contentFlg);

        if(contentFlg === 'wasm'){
            contract = new ContractPromise(api, wasmNftAbi, WASM_NFT_CONTRACT_ADDRESS);
        } else if(contentFlg === 'astar') {
            contract = new ContractPromise(api, wasmNftAbi, ASTAR_NFT_CONTRACT_ADDRESS);
        } else {
            contract = new ContractPromise(api, wasmNftAbi, SHIDEN_NFT_CONTRACT_ADDRESS);
        }

        // call getNftName メソッド
        const {result, output} = 
            await contract.query.getNftDescription(
                contractAddress,
                {
                    gasLimit: api.registry.createType('WeightV2', {
                        refTime,
                        proofSize,
                    }) as WeightV2,
                    storageDepositLimit,
                },);

        // check if the call was successful
        if (result.isOk) {
            const outputData: any = output;
            // json形式にして再び取得する。
            const jsonData = JSON.parse(outputData.toString());
            const description:string = jsonData.ok;
            return description;
        } else {
            console.error('error');
        }
    }; 

    return (
        <ContractContext.Provider 
            value={{
                api,
                connectWallet,
                actingAddress,
                isLoading,
                nftInfos,
                contentInfos,
                getNftInfos,
                mint,
                good,
                quiz,
                cheer,
            }}
        >
            {children}
        </ContractContext.Provider>
    );
}

