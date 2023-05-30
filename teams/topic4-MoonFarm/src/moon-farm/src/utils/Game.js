import { KeyringProvider } from "@unique-nft/accounts/keyring";

import { waitReady } from "@polkadot/wasm-crypto";
import Sdk from '@unique-nft/sdk';

//utils
//DynamicToken
import { MintSeed, MintLand } from "./DynamicToken";
//CropsCollection
import { destroyCrops } from "./CropsCollection";
//GameToken
import { mintGameToken, transferGameToken } from "./GameToken";

//
const GAME_TOKEN_COLLECTION_ID = 1473;

//MARKET
//Sell Crops
export const sellCrops = async (_sdk, _signer, _type, _amount) => {
    //destroy crops
    destroyCrops(_sdk, _signer, _type, _amount);
    //mint game token
    if (_type === 0) {
        _amount *= 3;
    } else {
        _amount *= 5;
    }
    mintGameToken(GAME_TOKEN_COLLECTION_ID, _signer, _amount);
}
//Buy Seed
export const buySeed = async (_sdk, _signer, _type, _cost) => {
    await waitReady();

    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);

    //transfer game token
    const isCompleted = await transferGameToken(_sdk, GAME_TOKEN_COLLECTION_ID, _signer, _adminAccount.address, _cost);

    if (isCompleted)
        //Mint Seed function
        await MintSeed(_signer, _type);
}
//Buy Land
export const buyLand = async (_sdk, _signer, _cost) => {
    await waitReady();

    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);

    //transfer game token
    const isCompleted = await transferGameToken(_sdk, GAME_TOKEN_COLLECTION_ID, _signer, _adminAccount.address, _cost);

    if (isCompleted)
        //Mint Seed function
        await MintLand(_signer);
}


//TILE MENU
//Harvest Crops
export const harvest = async (_clientSdk) => {

}

export const mintToken = async (sdk, tokenArgs) => {
    const {parsed, error} = await sdk.token.create.submitWaitResult(tokenArgs);

    if (parsed?.tokenId) {
        return sdk.token.get({collectionId: tokenArgs.collectionId, tokenId: parsed.tokenId});
    } else {
        throw error ? error : new Error('mint token error');
    }
}

export const nestToken = async (sdk, nestedArgs) => {
    const { address, parent, nested } = nestedArgs;
    const { parsed, error } = await sdk.token.nest.submitWaitResult({
        address,
        parent,
        nested,
    });

    if (error) {
        console.log('nest token error', error);
        process.exit();
    }
    const { collectionId, tokenId } = parsed;
    //console.log(`Token ${tokenId} from collection ${collectionId} successfully nested`);
    return sdk.token.get({ collectionId, tokenId });
}

export const createUnNestedToken = async (sdk, nestedArgs) => {
    const { address, parent, nested } = nestedArgs;
        const { parsed, error } = await sdk.token.unnest.submitWaitResult({
            address,
            parent,
            nested,
        });
        
        if (error) {
            console.log('create unnest token error', error);
            process.exit();
        }
      
        const { collectionId, tokenId } = parsed;
      
        console.log(`Token ${tokenId} from collection ${collectionId} successfully unnested`);
      
        return sdk.token.get({ collectionId, tokenId });
}

export const burnToken = async (sdk, burnArgs) => {
    const {parsed, error} = await sdk.token.burn.submitWaitResult(burnArgs);
    if (error) {
        console.log('burn token error', error);
        process.exit();
    }
    console.log('burn token: ', parsed);
}

export const transfer = async (sdk, args) => {
    const result = await sdk.token.transfer.submitWaitResult(args);

    console.log(result.parsed);
}

export const nestData = {
    parentCollection: {
        name: 'Land',
        description: 'Collection for land',
        tokenPrefix: 'MFL',
        // coverPictureIpfsCid: '',
    },
    parentToken: {
        // image: {
        //     url: '',
        // },
        // file: {
        //     ipfsCid: '',
        // },
        name: {
            _: 'Land',
        },
        description: {
            _: 'Land token for nesting',
        },
    },
    seedA0Token: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'SeedA0',
        },
        description: {
            _: 'SeedA0 token for nesting',
        },
    },
    seedA1Token: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'SeedA1',
        },
        description: {
            _: 'SeedA1 token for nesting',
        },
    },
    seedA2Token: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'SeedA2',
        },
        description: {
            _: 'SeedA2 token for nesting',
        },
    },
    seedB0Token: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'SeedB0',
        },
        description: {
            _: 'SeedB0 token for nesting',
        },
    },
    seedB1Token: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'SeedB1',
        },
        description: {
            _: 'SeedB1 token for nesting',
        },
    },
    seedB2Token: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'SeedB2',
        },
        description: {
            _: 'SeedB2 token for nesting',
        },
    },
    scarecrow: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'Scarecrow',
        },
        description: {
            _: 'Scarecrow token for nesting',
        },
    },
    auto_watering: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'Auto-watering',
        },
        description: {
            _: 'Auto-watering token for nesting',
        },
    },
    fertilize: {
        image: {
            ipfsCid: '',
        },
        name: {
            _: 'Fertilize',
        },
        description: {
            _: 'Fertilize token for nesting',
        },
    }
}