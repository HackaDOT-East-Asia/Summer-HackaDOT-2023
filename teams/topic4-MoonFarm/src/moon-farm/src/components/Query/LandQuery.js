import { useState, useEffect } from 'react';

//Apollo GraphQL
import { useQuery, gql } from '@apollo/client';

export const LandQuery = ({signer}) => {

    //
    const [landRes, setLandRes] = useState(null);

    //
    const SEED_COLLECTION_GET_ALL_OWNED = gql`
        query tokens($ownerAddress: String!) {
            tokens (where: {
                collection_id: { _eq: 1619 },
                owner: { _eq: $ownerAddress },
            }) {
                count
                data {
                    token_id,
                    properties,
                }
            }
        }
    `;

    //
    const { data, loading, error, refetch } = useQuery(
        SEED_COLLECTION_GET_ALL_OWNED, {
        variables: {
            ownerAddress: signer.address,
        },
    })

    //
    try {
        if (!error && !loading)
            if (data.tokens.data !== landRes)
                setLandRes(data.tokens.data); 
    } catch (e) {
        console.log('fetch land error: ',e);
    }

    //
    useEffect(() => {
        const interval = setInterval(async () => {
            //Apollo Client refetch
            refetch({ ownerAddress: signer.address });

            
        }, 3000);

        return () => clearInterval(interval);
    }, [signer])

    return landRes;
}