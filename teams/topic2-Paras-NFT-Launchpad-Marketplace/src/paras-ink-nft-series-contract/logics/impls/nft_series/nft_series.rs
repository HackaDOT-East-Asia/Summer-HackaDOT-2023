// Copyright (c) 2022 Astar Network
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the"Software"),
// to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

use crate::impls::nft_series::types::Data;
pub use crate::traits::nft_series::NFTSeries;

use openbrush::{
    contracts::{
        ownable::*,
        psp34::extensions::{enumerable::*, metadata::*},
        reentrancy_guard::*,
    },
    modifiers,
    traits::{AccountId, Balance, Storage},
};

use ink::prelude::string::String as PreludeString;
use ink::prelude::vec::Vec;

use super::types::{NFTSeriesError, TokenSeriesMetadata};

pub trait Internal {
    /// Mint nft internal
    fn mint_internal(
        &mut self,
        token_series_id: u64,
        receiver_address: AccountId,
        is_buy: bool,
    ) -> Result<u64, PSP34Error>;
}

impl<T> NFTSeries for T
where
    T: Storage<Data>
        + Storage<psp34::Data<enumerable::Balances>>
        + Storage<reentrancy_guard::Data>
        + Storage<ownable::Data>
        + Storage<metadata::Data>
        + psp34::extensions::metadata::PSP34Metadata
        + psp34::Internal,
{
    default fn nft_create_collection(
        &mut self,
        title: Option<PreludeString>,
        description: Option<PreludeString>,
        media: Option<PreludeString>,
        cover: Option<PreludeString>,
        twitter: Option<PreludeString>,
        website: Option<PreludeString>,
    ) -> Result<u64, NFTSeriesError> {
        let caller = Self::env().caller();

        let collection_id = self.data::<Data>().last_collection_id + 1;

        self.data::<Data>()
            .collection_to_creator_address
            .insert(collection_id, &caller);

        self.data::<Data>().last_collection_id = collection_id;

        self._emit_nft_create_collection(
            collection_id,
            caller,
            title,
            description,
            media,
            cover,
            twitter,
            website,
        );

        Ok(collection_id)
    }

    default fn nft_create_series(
        &mut self,
        collection_id: u64,
        base_uri: PreludeString,
        price: Option<Balance>,
        copies: u64,
        royalty: Vec<(AccountId, u32)>,
        iterative: bool,
    ) -> Result<u64, NFTSeriesError> {
        let caller = Self::env().caller();

        let collection_creator = self
            .data::<Data>()
            .collection_to_creator_address
            .get(collection_id)
            .unwrap();

        if caller != collection_creator {
            return Err(NFTSeriesError::NotCreator);
        }

        let mut royalty_total = 0;
        for royalty_item in royalty.clone() {
            royalty_total += royalty_item.1;
            if royalty_total > 10000 {
                return Err(NFTSeriesError::RoyaltyInvalid);
            }
        }

        let token_series_id = self.data::<Data>().last_token_series_id + 1;
        self.data::<Data>().token_series.insert(
            token_series_id,
            &TokenSeriesMetadata {
                base_uri: base_uri.clone(),
                price,
                royalty: royalty.clone(),
                iterative,
                copies,
                minted_copies: 0,
                collection_id,
            },
        );
        self.data::<Data>().last_token_series_id += 1;

        // emit event
        self._emit_nft_create_series(
            token_series_id,
            base_uri,
            price,
            copies,
            royalty,
            iterative,
            caller,
            collection_id,
        );

        Ok(token_series_id)
    }

    #[modifiers(non_reentrant)]
    default fn nft_mint(
        &mut self,
        token_series_id: u64,
        receiver_address: AccountId,
    ) -> Result<u64, PSP34Error> {
        let caller = Self::env().caller();

        let collection_id = self
            .data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap()
            .collection_id;

        let collection_creator = self
            .data::<Data>()
            .collection_to_creator_address
            .get(collection_id)
            .unwrap();

        if caller != collection_creator {
            return Err(PSP34Error::NotApproved);
        }

        let token_id = self.mint_internal(token_series_id, receiver_address, false);

        Ok(token_id.unwrap())
    }

    #[modifiers(non_reentrant)]
    default fn nft_buy(
        &mut self,
        token_series_id: u64,
        receiver_address: Option<AccountId>,
    ) -> Result<u64, PSP34Error> {
        let caller = Self::env().caller();
        let receiver_address = receiver_address.unwrap_or(caller);
        let token_id = self
            .mint_internal(token_series_id, receiver_address, true)
            .unwrap();

        let token_series_metadata = self
            .data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap();

        self._emit_nft_buy(
            token_series_id,
            token_id,
            receiver_address,
            token_series_metadata.price.unwrap(),
        );

        Ok(token_id)
    }

    fn nft_mint_and_approve(
        &mut self,
        _token_series_id: u64,
        _account_address: AccountId,
    ) -> Result<(), PSP34Error> {
        Ok(())
    }

    default fn nft_decrease_series_copies(
        &mut self,
        token_series_id: u64,
        decrease_copies: u16,
    ) -> Result<(), NFTSeriesError> {
        let caller = Self::env().caller();

        let mut token_series_metadata = self
            .data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap();

        let collection_creator = self
            .data::<Data>()
            .collection_to_creator_address
            .get(token_series_metadata.collection_id)
            .unwrap();

        if caller != collection_creator {
            return Err(NFTSeriesError::NotCreator);
        }

        if token_series_metadata.copies - token_series_metadata.minted_copies
            < decrease_copies as u64
        {
            return Err(NFTSeriesError::TooManyTokensToMint);
        }

        token_series_metadata.copies -= decrease_copies as u64;

        self._emit_decrease_series_copies(token_series_id, token_series_metadata.copies.clone());

        self.data::<Data>()
            .token_series
            .insert(token_series_id, &token_series_metadata);

        Ok(())
    }

    default fn nft_set_series_price(
        &mut self,
        token_series_id: u64,
        price: Option<Balance>,
    ) -> Result<(), NFTSeriesError> {
        let caller = Self::env().caller();

        let mut token_series_metadata = self
            .data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap();

        let collection_creator = self
            .data::<Data>()
            .collection_to_creator_address
            .get(token_series_metadata.collection_id)
            .unwrap();

        if caller != collection_creator {
            return Err(NFTSeriesError::NotCreator);
        }

        token_series_metadata.price = price;

        self.data::<Data>()
            .token_series
            .insert(token_series_id, &token_series_metadata);

        self._emit_set_series_price(token_series_id, price);

        Ok(())
    }

    /// Set max number of tokens which could be minted per call
    #[modifiers(only_owner)]
    default fn set_max_mint_amount(&mut self, max_amount: u64) -> Result<(), PSP34Error> {
        self.data::<Data>().max_amount = max_amount;
        Ok(())
    }

    /// Get max supply of tokens
    default fn max_supply(&self) -> u64 {
        self.data::<psp34::Data<enumerable::Balances>>()
            .total_supply()
            .try_into()
            .unwrap()
    }

    /// Get max number of tokens which could be minted per call
    default fn get_max_mint_amount(&self) -> u64 {
        self.data::<Data>().max_amount
    }

    default fn get_series(&self, token_series_id: u64) -> TokenSeriesMetadata {
        self.data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap()
    }

    default fn get_transaction_fee(&self) -> u16 {
        self.data::<Data>().transaction_fee
    }

    default fn get_token_series(&self, token_id: u64) -> Option<u64> {
        self.data::<Data>().token_to_token_series.get(token_id)
    }

    default fn royalty_info(
        &self,
        token_id: u64,
        sale_price: Balance,
    ) -> Result<Vec<(AccountId, Balance)>, PSP34Error> {
        let token_series_id = self
            .data::<Data>()
            .token_to_token_series
            .get(token_id)
            .unwrap();

        let token_series_metadata = self
            .data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap();

        let mut payout = Vec::<(AccountId, Balance)>::new();

        for royalty_item in token_series_metadata.royalty {
            payout.push((
                royalty_item.0,
                sale_price.checked_mul(royalty_item.1 as u128).unwrap() / 10000u128,
            ));
        }

        Ok(payout)
    }

    default fn _emit_nft_create_series(
        &self,
        _token_series_id: u64,
        _base_uri: PreludeString,
        _price: Option<Balance>,
        _supply: u64,
        _royalty: Vec<(AccountId, u32)>,
        _iterative: bool,
        _creator_address: AccountId,
        _collection_id: u64,
    ) {
    }

    default fn _emit_set_series_price(&self, _token_series_id: u64, _price: Option<Balance>) {}

    default fn _emit_decrease_series_copies(&self, _token_series_id: u64, _copies: u64) {}

    default fn _emit_nft_create_collection(
        &self,
        _collection_id: u64,
        _creator_address: AccountId,
        _title: Option<PreludeString>,
        _description: Option<PreludeString>,
        _media: Option<PreludeString>,
        _cover: Option<PreludeString>,
        _twitter: Option<PreludeString>,
        _website: Option<PreludeString>,
    ) {
    }

    default fn _emit_nft_buy(
        &self,
        _token_series_id: u64,
        _token_id: u64,
        _to: AccountId,
        _price: Balance,
    ) {
    }
}

/// Helper trait for NFTSeries
impl<T> Internal for T
where
    T: Storage<Data> + Storage<psp34::Data<enumerable::Balances>> + psp34::Internal,
{
    default fn mint_internal(
        &mut self,
        token_series_id: u64,
        receiver_address: AccountId,
        is_buy: bool,
    ) -> Result<u64, PSP34Error> {
        let token_series_metadata = self
            .data::<Data>()
            .token_series
            .get(token_series_id)
            .unwrap();

        if token_series_metadata.minted_copies >= token_series_metadata.copies {
            return Err(PSP34Error::Custom("SupplyExhausted".as_bytes().to_vec()));
        }

        let collection_creator = self
            .data::<Data>()
            .collection_to_creator_address
            .get(token_series_metadata.collection_id)
            .unwrap();

        if is_buy {
            let transferred_value = Self::env().transferred_value();

            if let Some(price) = token_series_metadata.price {
                if transferred_value < price {
                    return Err(PSP34Error::Custom("BadMintValue".as_bytes().to_vec()));
                }

                // transfer payout
                if price > 0 {
                    let marketplace_share = transferred_value
                        .checked_mul(self.data::<Data>().transaction_fee as u128)
                        .unwrap_or_default()
                        / 10_000;
                    let creator_share = transferred_value
                        .checked_sub(marketplace_share)
                        .unwrap_or_default();

                    Self::env()
                        .transfer(
                            self.data::<Data>().marketplace_treasury.unwrap(),
                            marketplace_share,
                        )
                        .map_err(|_| {
                            PSP34Error::Custom("TransferToMarketplaceFailed".as_bytes().to_vec())
                        })?;

                    Self::env()
                        .transfer(collection_creator, creator_share)
                        .map_err(|_| {
                            PSP34Error::Custom("TransferToCreatorFailed".as_bytes().to_vec())
                        })?;
                }
            } else {
                return Err(PSP34Error::Custom(
                    "TokenSeriesNotOnSale".as_bytes().to_vec(),
                ));
            }
        }

        self.data::<Data>().token_series.insert(
            token_series_id,
            &TokenSeriesMetadata {
                base_uri: token_series_metadata.base_uri,
                price: token_series_metadata.price,
                royalty: token_series_metadata.royalty,
                iterative: token_series_metadata.iterative,
                copies: token_series_metadata.copies,
                minted_copies: token_series_metadata.minted_copies + 1,
                collection_id: token_series_metadata.collection_id,
            },
        );
        let mint_id = self.data::<Data>().last_token_id + 1;

        self.data::<psp34::Data<enumerable::Balances>>()
            ._mint_to(receiver_address, Id::U64(mint_id))?;
        self.data::<Data>().last_token_id += 1;

        self.data::<Data>()
            .token_to_token_series
            .insert(mint_id, &token_series_id);

        self._emit_transfer_event(None, Some(receiver_address), Id::U64(mint_id));

        Ok(mint_id)
    }
}
