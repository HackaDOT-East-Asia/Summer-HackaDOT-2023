import { KeyringProvider } from "@unique-nft/accounts/keyring";

import { waitReady } from "@polkadot/wasm-crypto";

import { AttributeType, COLLECTION_SCHEMA_NAME, SchemaTools } from "@unique-nft/schemas";

import Sdk from '@unique-nft/sdk';

//
import { mintToken, transfer } from "./Game";

//apollo graphQL
import { ApolloClient, InMemoryCache, ApolloProvider, gql, useQuery } from "@apollo/client";

const client = new ApolloClient({
    uri: 'https://scan-api.opal.uniquenetwork.dev/v1/graphql/',
    cache: new InMemoryCache(),
})

//seedCurrentRes[i].properties[0].value==='{"_":"seedB"}'
export const setProperties = async (_sdk, _signer) => {
    await waitReady();
    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);
    const _adminSdk = new Sdk({
        baseUrl: 'https://rest.unique.network/opal/v1',
        signer: _adminAccount,
    });
    

    const args = {
        address: _adminAccount.address,
        collectionId: 1639,
        tokenId: 1,
        properties: [{
            key: 'a.0',
            value: '9487'
        }]
    };
    const res = await _adminSdk.token.setProperties.submitWaitResult(args);
    console.log(res);
}

export const getProperties = async (_sdk, _signer, _tokenId) => {
    const args = {
        collectionId: 1639,
        tokenId: 6,
    };
    const res = await _sdk.token.properties(args);
    console.log(res);
    console.log(res.properties[1].value);
}

//Land Collection
export const MintLand = async (_signer) => {
    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);
    const _adminSdk = new Sdk({
        baseUrl: 'https://rest.unique.network/opal/v1',
        signer: _adminAccount,
    });

    const landTokenArgs = {
        address: _adminAccount.address,
        collectionId: 1619,
        name: 'Land',
        description: 'Land token for nesting',
        // data: {
        //     data: nestData.parentToken,
        //     image: {
        //         url: nestData.parentToken.image.url,
        //     }
        // }
        owner: _signer.address,
    }
    const landToken = await mintToken(_adminSdk, landTokenArgs);
    console.log('land token: ', landToken);
    //console.log('id', landToken.tokenId);
    /*
    const transferArgs = {
        address: _adminAccount.address,
        to: _signer.address,
        collectionId: 1619,
        tokenId: landToken.tokenId,
    }
    const landowner = await transfer(_adminSdk, transferArgs);
    */
}

//
export const MintSeed = async (_signer, _type) => {
    //admin
    await waitReady();

    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);
    const _adminSdk = new Sdk({
        baseUrl: 'https://rest.unique.network/opal/v1',
        signer: _adminAccount,
    });

    //Set properties
    const seedtokenProperties = SchemaTools.encodeUnique.token({
        image: {
            urlInfix: '1',
        },
        encodedAttributes: {
            '0': {_: 'seed'+_type},
            '1': 0,
            '2': '',
            '3': 3,
        }
    }, SeedSchema);
    const seedTokenArgs = {
        address: _adminAccount.address,
        collectionId: 1639,
        properties: seedtokenProperties,
        name: 'Seed',
        description: 'Seed token for nesting',
        owner: _signer.address,
    }

    const seedToken = await mintToken(_adminSdk, seedTokenArgs);
    console.log('seed token: ', seedToken);
    /*
    const transferArgs = {
        address: _adminAccount.address,
        to: _signer.address,
        collectionId: 1620,
        tokenId: seedToken.tokenId,
    }
    const seedowner = await transfer(_adminSdk, transferArgs);
    */
}

export const getSeedBalance = async (address) => {
    const res = client
    .query({
        query: gql`
        query GetTokens($ownerAddress: String!) {
            tokens (where: {
                collection_id: {_eq: 1620},
                owner: {_eq: $ownerAddress}
            }) {
                count
                data {
                    token_id
                    token_name
                    token_prefix
                }
            }
        }`,
        variables: {
            ownerAddress: address,
        },
    })
    res.then(value => {
        console.log('seed data 1',value);
    }).catch(err => {
        console.log(err);
    })

    console.log('seed data', res);
    console.log('seed d1', res.value);
}

//SeedSchema
const SeedSchema = {
    schemaName: COLLECTION_SCHEMA_NAME.unique,
    schemaVersion: '1.0.0',
    image: {urlTemplate: 'https://ipfs.unique.network/ipfs/QmcAcH4F9HYQtpqKHxBFwGvkfKb8qckXj2YWUrcc8yd24G/image{infix}.png'},
    coverPicture: {urlInfix: '0'},

    attributesSchemaVersion: '1.0.0',
    attributesSchema: {
        0: {
            name: {_: "S"},
            type: AttributeType.string,
            optional: true,
            isArray: false,
        },
    }
}