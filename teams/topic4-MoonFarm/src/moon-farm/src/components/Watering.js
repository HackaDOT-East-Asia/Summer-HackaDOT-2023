import { waitReady } from "@polkadot/wasm-crypto";
import Sdk from '@unique-nft/sdk';

export const Watering = ({sdk, signer, id}) => {
    const baseUrl = 'https://rest.unique.network/opal/v1';
    function createSdk(account) {
        const options = {
            baseUrl,
            signer: account,
        }
        return new Sdk(options);
    }

    const checkInterval = async () => {
        const date_time = Date.now();
        console.log('date now', date_time);
        //get time property
        const args = {
            collectionId: 1619,
            tokenId: id,
        };
        const child_result = await sdk.token.children(args);
        for(let i=0; i<child_result.children.length;i++){
            if(child_result.children[i].collectionId==1639){
                const timeArgs = {
                    collectionId: 1639,
                    tokenId: child_result.children[i].tokenId,
                    propertyKeys: ['a.2'],
                }
                const time_result = await sdk.token.properties(timeArgs);
                if((date_time - time_result) > 1000) {
                    return true;
                }
            }
        }
        return false;
    }

    const confirm_water = async () => {
        const canWater = await checkInterval();
        if(canWater){
            const date_time = Date.now();
            const owner_mnemonic = 'robot huge puzzle shoulder connect violin ensure able front umbrella learn harsh';
            const owner_account = await KeyringProvider.fromMnemonic(owner_mnemonic);
            const owner_address = owner_account.address;
            const owner_sdk = createSdk(owner_account);
            const args = {
                collectionId: 1619,
                tokenId: id,
            };
            const child_result = await sdk.token.children(args);
            for(let i=0; i<child_result.children.length;i++){
                if(child_result.children[i].collectionId==1639){
                    const args = {
                        address: owner_address,
                        collectionId: 1639,
                        tokenId: child_result.children[i].tokenId,
                        properties: [{
                            key: 'a.2',
                            value: date_time,
                        }]
                    };
                    const res = await owner_sdk.token.setProperties.submitWaitResult(args);
                    console.log(res);
                    const time_args = {
                        address: owner_address,
                        collectionId: 1639,
                        tokenId: child_result.children[i].tokenId,
                        properties: [{
                            key: 'a.3',
                            value: 0,
                        }]
                    };
                    const time_res = await owner_sdk.token.setProperties.submitWaitResult(time_args);
                    console.log(time_res);
                }
            }
        }
    }

    return(
        <>
        <div>
            <button
                onClick={onclose}>
                    Cancel
            </button>
            <button
                onClick={confirm_water}>
                    Confirm
            </button>
        </div>
        </>
    )
}