import Sdk from '@unique-nft/sdk';
import '../../App.css';

const CheckBundleTest = () => {

    const baseUrl = 'https://rest.unique.network/opal/v1';
    
    // Creating an SDK client
    function createSdk(account) {
        const options = {
            baseUrl,
            //signer: account,
        }
        return new Sdk(options);
    }

    const IsBundle = async () => {
        const sdk = createSdk();

        const isBundle = await sdk.token.isBundle({
            collectionId: 1368,
            tokenId: 2,
        });

        console.log('is bundle?',isBundle);

        const result = await sdk.token.getBundle({
            collectionId: 1370,
            tokenId: 1,
        });

        console.log('getBundle', result);
    }

    return(
        <>
            <button
                onClick={IsBundle}
                className='btn btn-blue'>
                    IsBundle?
            </button>
        </>
    )
}
export default CheckBundleTest;