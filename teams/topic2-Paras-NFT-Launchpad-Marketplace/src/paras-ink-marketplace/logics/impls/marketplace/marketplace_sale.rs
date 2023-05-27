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

use super::types::{NftContractType, OfferItem, RegisteredCollection};
use crate::{
    ensure,
    impls::marketplace::types::{Data, Item, MarketplaceError},
    traits::marketplace::MarketplaceSale,
};
use ink::prelude::vec::Vec;
use nft::nft::NFTSeriesRef;
use openbrush::{
    contracts::{ownable::*, psp34::*, reentrancy_guard::*},
    modifiers,
    traits::{AccountId, Balance, Hash, Storage, String},
};

pub trait Internal {
    /// Checks if contract caller is an token owner
    fn check_token_owner(
        &self,
        contract_address: AccountId,
        token_id: Id,
    ) -> Result<(), MarketplaceError>;

    fn check_token_allowance(
        &self,
        contract_address: AccountId,
        token_id: Id,
    ) -> Result<(), MarketplaceError>;

    /// Checks token price.
    fn check_price(
        &self,
        transferred_value: Balance,
        price: Balance,
    ) -> Result<(), MarketplaceError>;

    /// Checks fee
    fn check_fee(&self, fee: u16, max_fee: u16) -> Result<(), MarketplaceError>;

    /// Checks if token is listed for sale on the marketplace.
    fn is_token_listed(&self, contract_address: AccountId, token_id: Id) -> bool;

    /// Transfers token.
    fn transfer_token(
        &self,
        contract_address: AccountId,
        token_id: Id,
        token_owner: AccountId,
        buyer: AccountId,
        seller_fee: Balance,
        marketplace_fee: Balance,
        royalty_receiver: AccountId,
        author_royalty: Balance,
        token_price: Balance,
    ) -> Result<(), MarketplaceError>;

    /// Get NFT contract hash needed for factory method
    fn get_nft_contract_hash(
        &self,
        contract_type: &NftContractType,
    ) -> Result<Hash, MarketplaceError>;

    fn get_deposit_internal(&self, account_id: AccountId) -> Balance;
}

pub trait MarketplaceSaleEvents {
    fn emit_token_listed_event(&self, contract: AccountId, token_id: Id, price: Option<Balance>);
    fn emit_make_offer_event(
        &self,
        bidder_id: AccountId,
        contract: AccountId,
        token_id: Option<Id>,
        quantity: u64,
        price_per_item: Balance,
        extra: String,
        offer_id: u128,
    );

    fn emit_cancel_offer_event(&self, offer_id: u128);
    fn emit_accept_offer_event(&self, offer_id: u128);
    fn emit_token_bought_event(
        &self,
        contract: AccountId,
        token_id: Id,
        price: Balance,
        from: AccountId,
        to: AccountId,
    );
    fn emit_collection_registered_event(&self, contract: AccountId);
    fn emit_deposit_event(&self, account_id: AccountId, amount: Balance);
    fn emit_withdraw_event(&self, account_id: AccountId, amount: Balance);
}

impl<T> MarketplaceSale for T
where
    T: Storage<Data> + Storage<ownable::Data> + Storage<reentrancy_guard::Data>,
{
    /// Sets a hash of a Shiden34 contract to be instantiated by factory call.
    #[modifiers(only_owner)]
    default fn set_nft_contract_hash(
        &mut self,
        contract_type: NftContractType,
        contract_hash: Hash,
    ) -> Result<(), MarketplaceError> {
        self.data::<Data>()
            .nft_contract_hash
            .insert(&contract_type, &contract_hash);
        Ok(())
    }

    /// Gets a NFT contract hash.
    default fn nft_contract_hash(&self, contract_type: NftContractType) -> Hash {
        self.get_nft_contract_hash(&contract_type).unwrap()
    }

    /// Creates a NFT item sale on the marketplace.
    default fn list(
        &mut self,
        contract_address: AccountId,
        token_id: Id,
        price: Balance,
    ) -> Result<(), MarketplaceError> {
        self.check_token_owner(contract_address, token_id.clone())?;
        self.check_token_allowance(contract_address, token_id.clone())?;
        self.data::<Data>().items.insert(
            &(contract_address, token_id.clone()),
            &Item {
                owner: Self::env().caller(),
                price,
            },
        );
        self.emit_token_listed_event(contract_address, token_id, Some(price));
        Ok(())
    }

    /// Removes a NFT from the marketplace sale.
    default fn unlist(
        &mut self,
        contract_address: AccountId,
        token_id: Id,
    ) -> Result<(), MarketplaceError> {
        ensure!(
            self.is_token_listed(contract_address, token_id.clone()),
            MarketplaceError::ItemNotListedForSale
        );
        self.check_token_owner(contract_address, token_id.clone())?;

        self.data::<Data>()
            .items
            .remove(&(contract_address, token_id.clone()));
        self.emit_token_listed_event(contract_address, token_id, None);
        Ok(())
    }

    /// Buys NFT item from the marketplace.
    #[modifiers(non_reentrant)]
    default fn buy(
        &mut self,
        contract_address: AccountId,
        token_id: Id,
    ) -> Result<(), MarketplaceError> {
        let item = self
            .data::<Data>()
            .items
            .get(&(contract_address, token_id.clone()))
            .ok_or(MarketplaceError::ItemNotListedForSale)?;

        let token_owner = PSP34Ref::owner_of(&contract_address, token_id.clone())
            .ok_or(MarketplaceError::TokenDoesNotExist)?;
        let caller = Self::env().caller();
        ensure!(token_owner != caller, MarketplaceError::AlreadyOwner);

        let value = Self::env().transferred_value();
        self.check_price(value, item.price)?;

        let collection = self
            .data::<Data>()
            .registered_collections
            .get(&contract_address)
            .unwrap();

        let marketplace_fee = value
            .checked_mul(self.data::<Data>().fee as u128)
            .unwrap_or_default()
            / 10_000;

        let author_address;
        let author_royalty = if let Some(royalty) = collection.royalty {
            author_address = royalty.0;

            value.checked_mul(royalty.1 as u128).unwrap_or_default() / 10_000
        } else {
            let token_id_number = match token_id {
                Id::U64(x) => x,
                _ => panic!(),
            };

            // only support 1 for now
            if collection.contract_type == NftContractType::NFTSeries {
                match NFTSeriesRef::royalty_info(&contract_address, token_id_number, value) {
                    Ok(payouts) => {
                        if let Some(payout) = payouts.get(0) {
                            author_address = payout.0;
                            payout.1
                        } else {
                            author_address = contract_address;
                            0
                        }
                    }
                    Err(_) => {
                        author_address = contract_address;
                        0
                    }
                }
            } else {
                author_address = contract_address;
                0
            }
        };

        let seller_fee = value
            .checked_sub(marketplace_fee)
            .unwrap_or_default()
            .checked_sub(author_royalty)
            .unwrap_or_default();

        self.transfer_token(
            contract_address,
            token_id,
            token_owner,
            caller,
            seller_fee,
            marketplace_fee,
            author_address,
            author_royalty,
            value,
        )
    }

    /// Registers NFT collection to the marketplace.
    default fn register(
        &mut self,
        contract_address: AccountId,
        royalty_receiver: Option<AccountId>,
        royalty: Option<u16>,
        contract_type: NftContractType,
    ) -> Result<(), MarketplaceError> {
        let caller = Self::env().caller();

        // Check if caller is Marketplace owner of NFT owner.
        if self.data::<ownable::Data>().owner != caller
            && OwnableRef::owner(&contract_address) != caller
        {
            return Err(MarketplaceError::NotOwner);
        }

        if self
            .data::<Data>()
            .registered_collections
            .get(&contract_address)
            .is_some()
        {
            Err(MarketplaceError::ContractAlreadyRegistered)
        } else {
            if royalty.is_some() {
                let max_fee = self.data::<Data>().max_fee;
                self.check_fee(royalty.unwrap(), max_fee)?;
                self.data::<Data>().registered_collections.insert(
                    &contract_address,
                    &RegisteredCollection {
                        royalty: Some((royalty_receiver.unwrap(), royalty.unwrap())),
                        contract_type,
                    },
                );
            } else {
                self.data::<Data>().registered_collections.insert(
                    &contract_address,
                    &RegisteredCollection {
                        royalty: None,
                        contract_type,
                    },
                );
            }
            self.emit_collection_registered_event(contract_address);
            Ok(())
        }
    }

    /// Gets registered collection.
    default fn get_registered_collection(
        &self,
        contract_address: AccountId,
    ) -> Option<RegisteredCollection> {
        self.data::<Data>()
            .registered_collections
            .get(&contract_address)
    }

    /// Sets the marketplace fee.
    #[modifiers(only_owner)]
    default fn set_marketplace_fee(&mut self, fee: u16) -> Result<(), MarketplaceError> {
        let max_fee = self.data::<Data>().max_fee;
        self.check_fee(fee, max_fee)?;
        self.data::<Data>().fee = fee;

        Ok(())
    }

    /// Gets the marketplace fee.
    default fn get_marketplace_fee(&self) -> u16 {
        self.data::<Data>().fee
    }

    /// Gets max fee that can be applied to an item price.
    default fn get_max_fee(&self) -> u16 {
        self.data::<Data>().max_fee
    }

    /// Checks if NFT token is listed on the marketplace and returns token price.
    default fn get_price(&self, contract_address: AccountId, token_id: Id) -> Option<Balance> {
        match self.data::<Data>().items.get(&(contract_address, token_id)) {
            Some(item) => Some(item.price),
            _ => None,
        }
    }

    /// Gets the marketplace fee recipient.
    default fn get_fee_recipient(&self) -> AccountId {
        self.data::<Data>().market_fee_recipient.unwrap()
    }

    /// Sets the marketplace fee recipient.
    #[modifiers(only_owner)]
    default fn set_fee_recipient(
        &mut self,
        fee_recipient: AccountId,
    ) -> Result<(), MarketplaceError> {
        self.data::<Data>().market_fee_recipient = Option::Some(fee_recipient);

        Ok(())
    }

    default fn deposit(&mut self) -> Result<(), MarketplaceError> {
        let caller = Self::env().caller();
        let value = Self::env().transferred_value();

        let current_balance = self.data::<Data>().deposit.get(&caller).unwrap_or(0);
        self.data::<Data>()
            .deposit
            .insert(&caller, &(value + current_balance));

        self.emit_deposit_event(caller, value);
        Ok(())
    }

    default fn withdraw(&mut self, amount: Balance) -> Result<(), MarketplaceError> {
        let caller = Self::env().caller();
        let current_balance = self.data::<Data>().deposit.get(&caller).unwrap_or(0);

        if current_balance < amount {
            return Err(MarketplaceError::BalanceInsufficient);
        } else {
            self.data::<Data>()
                .deposit
                .insert(&caller, &(current_balance - amount));
            Self::env()
                .transfer(caller, amount)
                .map_err(|_| MarketplaceError::TransferToOwnerFailed)?;

            self.emit_withdraw_event(caller, amount);
            Ok(())
        }
    }

    default fn get_deposit(&self, account_id: AccountId) -> Balance {
        self.get_deposit_internal(account_id)
    }

    default fn cancel_offer(&mut self, offer_id: u128) -> Result<(), MarketplaceError> {
        let caller = Self::env().caller();

        let offer = self.data::<Data>().offer_items.get(&offer_id).unwrap();

        if offer.bidder_id != caller {
            return Err(MarketplaceError::NotOwner);
        }

        self.data::<Data>().offer_items.remove(&offer_id);

        // remove offer from enumerable
        let mut offer_ids = self
            .data::<Data>()
            .offer_items_per_contract_token_id
            .get(&(offer.contract_address, offer.token_id.clone()))
            .unwrap();

        offer_ids.swap_remove(offer_ids.binary_search(&offer_id).ok().unwrap());

        self.data::<Data>()
            .offer_items_per_contract_token_id
            .insert(
                &(offer.contract_address, offer.token_id.clone()),
                &offer_ids,
            );

        self.emit_cancel_offer_event(offer_id);

        Ok(())
    }

    default fn get_offer_active(&self, offer_id: u128) -> bool {
        let offer = self.data::<Data>().offer_items.get(&offer_id);

        if let Some(offer) = offer {
            let deposit = self.get_deposit_internal(offer.bidder_id);
            let total_amount = offer.quantity as u128 * offer.price_per_item;

            if deposit >= total_amount {
                return true;
            }
        }
        return false;
    }

    #[modifiers(non_reentrant)]
    default fn accept_offer(
        &mut self,
        offer_id: u128,
        token_id: Id,
    ) -> Result<(), MarketplaceError> {
        let offer_wrapped = self.data::<Data>().offer_items.get(&offer_id);
        if offer_wrapped.is_none() {
            return Err(MarketplaceError::OfferDoesNotExist);
        }
        let mut offer = offer_wrapped.unwrap();
        if let Some(token_id_offer) = offer.token_id.clone() {
            if token_id_offer != token_id {
                return Err(MarketplaceError::OfferNotMatch);
            }
        }

        let collection = self
            .data::<Data>()
            .registered_collections
            .get(&offer.contract_address)
            .unwrap();

        // check owner and allowance
        self.check_token_owner(offer.contract_address, token_id.clone())?;
        self.check_token_allowance(offer.contract_address, token_id.clone())?;

        // check if bidder's balance sufficient
        let deposit = self.get_deposit_internal(offer.bidder_id);

        if deposit < offer.price_per_item {
            return Err(MarketplaceError::BalanceInsufficient);
        }

        // update offer state
        if offer.quantity == 1 {
            self.data::<Data>().offer_items.remove(&offer_id);
        } else {
            offer.quantity -= 1;
            self.data::<Data>().offer_items.insert(&offer_id, &offer);
        }

        // update bidder state
        self.data::<Data>()
            .deposit
            .insert(&offer.bidder_id, &(deposit - offer.price_per_item));

        // remove from enumerable
        let mut offer_ids = self
            .data::<Data>()
            .offer_items_per_contract_token_id
            .get(&(offer.contract_address, offer.token_id.clone()))
            .unwrap();

        offer_ids.swap_remove(offer_ids.binary_search(&offer_id).ok().unwrap());

        self.data::<Data>()
            .offer_items_per_contract_token_id
            .insert(
                &(offer.contract_address, offer.token_id.clone()),
                &offer_ids,
            );

        let marketplace_fee = offer
            .price_per_item
            .checked_mul(self.data::<Data>().fee as u128)
            .unwrap_or_default()
            / 10_000;

        let author_address;
        let author_royalty = if let Some(royalty) = collection.royalty {
            author_address = royalty.0;

            offer
                .price_per_item
                .checked_mul(royalty.1 as u128)
                .unwrap_or_default()
                / 10_000
        } else {
            let token_id_number = match token_id {
                Id::U64(x) => x,
                _ => panic!(),
            };

            // only support 1 for now
            if collection.contract_type == NftContractType::NFTSeries {
                match NFTSeriesRef::royalty_info(
                    &offer.contract_address,
                    token_id_number,
                    offer.price_per_item,
                ) {
                    Ok(payouts) => {
                        if let Some(payout) = payouts.get(0) {
                            author_address = payout.0;
                            payout.1
                        } else {
                            author_address = offer.contract_address;
                            0
                        }
                    }
                    Err(_) => {
                        author_address = offer.contract_address;
                        0
                    }
                }
            } else {
                author_address = offer.contract_address;
                0
            }
        };

        let seller_fee = offer
            .price_per_item
            .checked_sub(marketplace_fee)
            .unwrap_or_default()
            .checked_sub(author_royalty)
            .unwrap_or_default();

        self.emit_accept_offer_event(offer_id);

        self.transfer_token(
            offer.contract_address,
            token_id,
            Self::env().caller(),
            offer.bidder_id,
            seller_fee,
            marketplace_fee,
            author_address,
            author_royalty,
            offer.price_per_item,
        )
    }

    default fn fulfill_offer(
        &mut self,
        _offer_id: u128,
        _token_id: Id,
    ) -> Result<(), MarketplaceError> {
        // TO DO: will be used for accepting offer with extra
        Ok(())
    }

    default fn make_offer(
        &mut self,
        contract_address: AccountId,
        token_id: Option<Id>,
        quantity: u64,
        price_per_item: Balance,
        extra: String,
    ) -> Result<u128, MarketplaceError> {
        let caller = Self::env().caller();

        let total_amount = quantity as u128 * price_per_item;

        let deposit = self.get_deposit_internal(caller);

        if deposit < total_amount {
            return Err(MarketplaceError::BalanceInsufficient);
        }

        let current_offer_id = self.data::<Data>().last_offer_id + 1;

        self.data::<Data>().last_offer_id = current_offer_id;

        self.data::<Data>().offer_items.insert(
            &current_offer_id,
            &OfferItem {
                bidder_id: caller,
                contract_address,
                token_id: token_id.clone(),
                quantity,
                price_per_item,
                extra: extra.clone(),
            },
        );

        let mut offer_ids = self
            .data::<Data>()
            .offer_items_per_contract_token_id
            .get(&(contract_address, token_id.clone()))
            .unwrap_or_default();

        offer_ids.push(current_offer_id);

        self.data::<Data>()
            .offer_items_per_contract_token_id
            .insert(&(contract_address, token_id.clone()), &offer_ids);

        // Emit event
        self.emit_make_offer_event(
            caller,
            contract_address,
            token_id,
            quantity,
            price_per_item,
            extra,
            current_offer_id,
        );
        Ok(1)
    }

    default fn get_offer_for_token(
        &self,
        contract_address: AccountId,
        token_id: Option<Id>,
    ) -> Result<Vec<u128>, MarketplaceError> {
        Ok(self
            .data::<Data>()
            .offer_items_per_contract_token_id
            .get(&(contract_address, token_id))
            .unwrap_or_default())
    }
}

impl<T> MarketplaceSaleEvents for T
where
    T: Storage<Data>,
{
    default fn emit_token_listed_event(
        &self,
        _contract: AccountId,
        _token_id: Id,
        _price: Option<Balance>,
    ) {
    }

    default fn emit_token_bought_event(
        &self,
        _contract: AccountId,
        _token_id: Id,
        _price: Balance,
        _from: AccountId,
        _to: AccountId,
    ) {
    }

    default fn emit_collection_registered_event(&self, _contract: AccountId) {}

    default fn emit_make_offer_event(
        &self,
        _contract: AccountId,
        _bidder_id: AccountId,
        _token_id: Option<Id>,
        _quantity: u64,
        _price_per_item: u128,
        _extra: String,
        _offer_id: u128,
    ) {
    }
    default fn emit_cancel_offer_event(&self, _offer_id: u128) {}
    default fn emit_accept_offer_event(&self, _offer_id: u128) {}

    default fn emit_deposit_event(&self, _account_id: AccountId, _amount: Balance) {}
    default fn emit_withdraw_event(&self, _account_id: AccountId, _amount: Balance) {}
}

impl<T> Internal for T
where
    T: Storage<Data>,
{
    default fn check_token_owner(
        &self,
        contract_address: AccountId,
        token_id: Id,
    ) -> Result<(), MarketplaceError> {
        if !self
            .data::<Data>()
            .registered_collections
            .contains(&contract_address)
        {
            return Err(MarketplaceError::NotRegisteredContract);
        }

        let caller = Self::env().caller();
        match PSP34Ref::owner_of(&contract_address, token_id) {
            Some(token_owner) => {
                ensure!(caller == token_owner, MarketplaceError::NotOwner);
                Ok(())
            }
            None => Err(MarketplaceError::TokenDoesNotExist),
        }
    }

    default fn check_token_allowance(
        &self,
        contract_address: AccountId,
        token_id: Id,
    ) -> Result<(), MarketplaceError> {
        let caller = Self::env().caller();
        let current_contract_id = Self::env().account_id();
        match PSP34Ref::allowance(
            &contract_address,
            caller,
            current_contract_id,
            Some(token_id),
        ) {
            false => Err(MarketplaceError::TokenNotApproved),
            true => Ok(()),
        }
    }

    default fn check_price(
        &self,
        transferred_value: Balance,
        price: Balance,
    ) -> Result<(), MarketplaceError> {
        ensure!(transferred_value >= price, MarketplaceError::BadBuyValue);

        Ok(())
    }

    default fn check_fee(&self, fee: u16, max_fee: u16) -> Result<(), MarketplaceError> {
        ensure!(fee <= max_fee, MarketplaceError::FeeTooHigh);

        Ok(())
    }

    default fn is_token_listed(&self, contract_address: AccountId, token_id: Id) -> bool {
        self.data::<Data>()
            .items
            .get(&(contract_address, token_id))
            .is_some()
    }

    default fn transfer_token(
        &self,
        contract_address: AccountId,
        token_id: Id,
        token_owner: AccountId,
        buyer: AccountId,
        seller_fee: Balance,
        marketplace_fee: Balance,
        royalty_receiver: AccountId,
        author_royalty: Balance,
        token_price: Balance,
    ) -> Result<(), MarketplaceError> {
        match PSP34Ref::transfer(&contract_address, buyer, token_id.clone(), Vec::new()) {
            Ok(()) => {
                Self::env()
                    .transfer(token_owner, seller_fee)
                    .map_err(|_| MarketplaceError::TransferToOwnerFailed)?;
                Self::env()
                    .transfer(
                        self.data::<Data>().market_fee_recipient.unwrap(),
                        marketplace_fee,
                    )
                    .map_err(|_| MarketplaceError::TransferToMarketplaceFailed)?;
                Self::env()
                    .transfer(royalty_receiver, author_royalty)
                    .map_err(|_| MarketplaceError::TransferToAuthorFailed)?;
                self.emit_token_bought_event(
                    contract_address,
                    token_id,
                    token_price,
                    token_owner,
                    buyer,
                );
                Ok(())
            }
            Err(_) => Err(MarketplaceError::UnableToTransferToken),
        }
    }

    default fn get_nft_contract_hash(
        &self,
        contract_type: &NftContractType,
    ) -> Result<Hash, MarketplaceError> {
        self.data::<Data>()
            .nft_contract_hash
            .get(&contract_type)
            .ok_or(MarketplaceError::NftContractHashNotSet)
    }

    default fn get_deposit_internal(&self, account_id: AccountId) -> Balance {
        self.data::<Data>().deposit.get(&account_id).unwrap_or(0)
    }
}
