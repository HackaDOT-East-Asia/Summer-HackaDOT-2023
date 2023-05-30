import { AttributeType, COLLECTION_SCHEMA_NAME, SchemaTools } from "@unique-nft/schemas";

import { KeyringProvider } from "@unique-nft/accounts/keyring";

import { waitReady } from "@polkadot/wasm-crypto";
import Sdk from '@unique-nft/sdk';

//apollo graphQL
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";

const client = new ApolloClient({
    uri: 'https://scan-api.opal.uniquenetwork.dev/v1/graphql/',
    cache: new InMemoryCache(),
})

const CROP_A = 1611;
const CROP_B = 1612;

//Get Game Token Balance
export const getCropsBalance = async (_sdk, _address) => {
    const res = await _sdk.fungible.getBalance({ collectionId: CROP_A, address: _address });
    //console.log('account balance A:',res.amount);
    let cropABal = res.amount;

    const res2 = await _sdk.fungible.getBalance({ collectionId: CROP_B, address: _address });
    //console.log('account balance B:',res2.amount);
    let cropBBal = res2.amount;

    return { cropABal, cropBBal }
}

//Mint Game Token
export const mintCrops = async (_collectionId, _address, _amount) => {
    await waitReady();

    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);
    const _sdk = new Sdk({
        baseUrl: 'https://rest.unique.network/opal/v1',
        signer: _adminAccount,
    });

    //Mint Transaction Args
    const tokenArgs = {
        address: _adminAccount.address,
        collectionId: _collectionId,
        amount: _amount,
        recipient: _address.address
    };
    const res = await _sdk.fungible.addTokens.submitWaitResult(tokenArgs);
    
    //console.log(res);
    if (!res.error) {
        console.log('mint is completed?',res.isCompleted);
    } else {
        console.log(res.error.message);
    }
}

export const destroyCrops = async (_sdk, _address, _type, _amount) => {
    await waitReady();

    //admin setup
    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);

    //
    const { cropABal, cropBBal } = await getCropsBalance(_sdk, _address.address);

    if (_type === 0) {
        console.log('_amount: ', _amount);
        console.log('A: ',cropABal);

        //burn
        transferGameToken(_sdk, CROP_A, _address, _adminAccount.address, _amount);
    } else {
        console.log('_amount: ', _amount);
        console.log('B: ',cropBBal);

        //burn
        transferGameToken(_sdk, CROP_B, _address, _adminAccount.address, _amount);
    }
}

/*
export const mintCrops = async (sdk, _account, _type) => {
    await waitReady();

    //admin setup
    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);
    const _sdk = new Sdk({
        baseUrl: 'https://rest.unique.network/opal/v1',
        signer: _adminAccount,
    });

    //Set properties
    const tokenProperties = SchemaTools.encodeUnique.token({
        image: {
            urlInfix: '1',
        },
        encodedAttributes: {
            0: {_: ''+_type},
        }
    }, CropsSchema);

    //Mint
    try {
        const tokenMintResult = await _sdk.token.create.submitWaitResult({
            address: _adminAccount.address,
            collectionId: CROPS_COLLECTION_ID,
            //amount: 10,
            properties: tokenProperties,
            //recipient: _account.address,
        });

        console.log(tokenMintResult.parsed.tokenId);

        //transfer
        transferCrops(_sdk, tokenMintResult.parsed.tokenId, _adminAccount, _account);


    } catch (err) {
        console.log('create token error', err);
    }
}
*/

//Transfer Game Token
export const transferGameToken = async (_sdk, _collectionId, _sender, _receiver, _amount) => {
    try {
        const transferArgs = {
            address: _sender.address,
            collectionId: _collectionId,
            recipient: _receiver,
            amount: _amount,
        };

        const res = await _sdk.fungible.transferTokens.submitWaitResult(transferArgs);

        //console.log(res);
        if (!res.error) {
            console.log('transaction is completed?',res.isCompleted);
        } else {
            console.log(res.error.message);
        }

    } catch (err) {
        console.log(err);
    }
}