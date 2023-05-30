import { useState, useEffect } from 'react';

//Apollo GraphQL
import { useQuery, gql } from '@apollo/client';

export const ItemQuery = ({signer}) => {

    //
    const [itemRes, setItemRes] = useState(null);

    //
    const Item_COLLECTION_GET_ALL_OWNED = gql`
        query tokens($ownerAddress: String!) {
            tokens (where: {
                collection_id: { _eq: 1618 },
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
        Item_COLLECTION_GET_ALL_OWNED, {
        variables: {
            ownerAddress: signer.address,
        },
    })

    try {
        if (!error && !loading)
            if (data.tokens.data !== itemRes)
                setItemRes(data.tokens.data); 
    } catch (e) {
        console.log('fetch item error: ',e);
    }

    useEffect(() => {
        const interval = setInterval(async () => {
            //Apollo Client refetch
            refetch({ ownerAddress: signer.address });

            
        }, 3000);

        return () => clearInterval(interval);
    }, [signer])

    return itemRes;
}