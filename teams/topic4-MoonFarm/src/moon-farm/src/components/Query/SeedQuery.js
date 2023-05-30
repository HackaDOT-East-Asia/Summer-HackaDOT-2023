import { useState, useEffect } from 'react';

//Apollo GraphQL
import { useQuery, gql } from '@apollo/client';

export const SeedQuery = ({signer}) => {

    //
    const [seedRes, setSeedRes] = useState(null);

    //
    const SEED_COLLECTION_GET_ALL_OWNED = gql`
        query tokens($ownerAddress: String!) {
            tokens (where: {
                collection_id: { _eq: 1639 },
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
            if (data.tokens.data !== seedRes)
                setSeedRes(data.tokens.data); 
    } catch (e) {
        console.log('fetch seed error: ',e);
    }

    //
    useEffect(() => {
        const interval = setInterval(async () => {
            //Apollo Client refetch
            refetch({ ownerAddress: signer.address });

            
        }, 3000);

        return () => clearInterval(interval);
    }, [signer])

    return seedRes;
}