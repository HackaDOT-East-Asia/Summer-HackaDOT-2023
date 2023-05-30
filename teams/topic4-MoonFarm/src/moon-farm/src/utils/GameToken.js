import { KeyringProvider } from "@unique-nft/accounts/keyring";

import { waitReady } from "@polkadot/wasm-crypto";
import Sdk from '@unique-nft/sdk';

//Get Game Token Balance
export const getGameTokenBalance = async (_sdk, _collectionId, _address) => {
    const res = await _sdk.fungible.getBalance({ collectionId: _collectionId, address: _address });
    //console.log('account balance:',res.amount);
    return res.amount;
}

//Mint Game Token
export const mintGameToken = async (_collectionId, _address, _amount) => {
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

//Transfer Game Token
export const transferGameToken = async (_sdk, _collectionId, _sender, _receiver, _amount) => {
    //console.log('TRANS _collectionId: ',_collectionId);
    //console.log('TRANS _sender: ',_sender);
    //console.log('TRANS _receiver: ',_receiver);
    //console.log('TRANS _amount: ',_amount);
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
            //let isCompleted = res.isCompleted
            return res.isCompleted;
        } else {
            console.log(res.error.message);
        }

    } catch (err) {
        console.log(err);
    }
}

export const exchangeGameToken = async (_sdk, _signer) => {
    const GAME_TOKEN_COLLECTION_ID = 1473;
    await waitReady();
    const _mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
    const _adminAccount = await KeyringProvider.fromMnemonic(_mnemonic);
    const _adminSdk = new Sdk({
        baseUrl: 'https://rest.unique.network/opal/v1',
        signer: _adminAccount,
    });
    //check balance
    const signerBalFirst = await _sdk.balance.get({address:_signer.address});
    //console.log('Before',signerBalFirst);
    //
    const args = {
        address: _signer.address,
        destination: _adminAccount.address,
        amount: 100,
    };

    try {
    const res = await _sdk.balance.transfer.submitWaitResult(args);
    } catch (e) {

    }
    //check balance
    const signerBal = await _sdk.balance.get({address:_signer.address});
    //console.log('After',signerBal);

    //transfer game token
    try {
        mintGameToken(GAME_TOKEN_COLLECTION_ID, _signer, 20);
    } catch (e) {
    }
}