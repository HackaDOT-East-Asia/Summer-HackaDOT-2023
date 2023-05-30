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

use crate::impls::launchpad::types::{
    Data, MilliSeconds, MintingStatus, Percentage, Shiden34Error,
};
pub use crate::traits::launchpad::Launchpad;

use ink::prelude::vec::Vec;
use openbrush::{
    contracts::{
        ownable::*,
        psp34::extensions::{enumerable::*, metadata::*},
    },
    modifiers,
    traits::{AccountId, Balance, Storage, String},
};

use ink::env::{hash, hash_bytes};

pub trait Internal {
    /// Check if the transferred mint values is as expected
    fn check_value(
        &self,
        transferred_value: u128,
        mint_amount: u64,
        minting_status: &MintingStatus,
    ) -> Result<(), PSP34Error>;

    /// Check amount of tokens to be minted
    fn check_amount(&self, mint_amount: u64) -> Result<(), PSP34Error>;

    fn get_pseudo_random(&mut self, max_amount: u64) -> u64;

    fn get_mint_id(&mut self) -> u64;

    fn get_refund_amount_and_price_internal(&self, token_id: u64) -> (Balance, Balance);

    fn get_available_to_withdraw_launchpad_internal(&self) -> Balance;

    fn get_available_to_withdraw_project_internal(&self) -> Balance;

    fn get_total_withdraw_share_internal(&self) -> u128;

    fn check_and_update_allowed_to_mint(
        &mut self,
        account_id: AccountId,
        mint_amount: u64,
        minting_status: &MintingStatus,
    ) -> Result<(), PSP34Error>;

    fn get_current_minting_status(&self) -> MintingStatus;
}

impl<T> Launchpad for T
where
    T: Storage<Data>
        + Storage<psp34::Data<enumerable::Balances>>
        + Storage<ownable::Data>
        + Storage<metadata::Data>
        + psp34::extensions::metadata::PSP34Metadata
        + psp34::Internal,
{
    /// Mint one or more tokens
    default fn mint(&mut self, to: AccountId, mint_amount: u64) -> Result<(), PSP34Error> {
        let caller_id = Self::env().caller();
        let minting_status = self.get_current_minting_status();
        let transferred_value = Self::env().transferred_value();

        self.check_amount(mint_amount)?;
        self.check_value(transferred_value, mint_amount, &minting_status)?;
        self.check_and_update_allowed_to_mint(caller_id, mint_amount, &minting_status)?;

        for _ in 0..mint_amount {
            let mint_id = self.get_mint_id();
            self.data::<psp34::Data<enumerable::Balances>>()
                ._mint_to(to, Id::U64(mint_id))?;
            self._emit_transfer_event(None, Some(to), Id::U64(mint_id));
            self.data::<Data>()
                .minting_type_for_token
                .insert(mint_id, &minting_status.to_index());
        }

        self.data::<Data>().total_sales += transferred_value;
        Ok(())
    }

    /// Mint next available token for the caller
    default fn mint_next(&mut self) -> Result<(), PSP34Error> {
        let caller_id = Self::env().caller();
        let minting_status = self.get_current_minting_status();
        let transferred_value = Self::env().transferred_value();

        self.check_amount(1)?;
        self.check_value(transferred_value, 1, &minting_status)?;
        self.check_and_update_allowed_to_mint(caller_id, 1, &minting_status)?;

        let mint_id = self.get_mint_id();
        self.data::<psp34::Data<enumerable::Balances>>()
            ._mint_to(caller_id, Id::U64(mint_id))?;

        self._emit_transfer_event(None, Some(caller_id), Id::U64(mint_id));

        self.data::<Data>()
            .minting_type_for_token
            .insert(mint_id, &minting_status.to_index());

        self.data::<Data>().total_sales += transferred_value;
        return Ok(());
    }

    /// Withdraws funds to contract owner
    default fn withdraw_launchpad(&mut self) -> Result<(), PSP34Error> {
        let caller_id = Self::env().caller();

        if caller_id != self.data::<Data>().launchpad_treasury.unwrap() {
            return Err(PSP34Error::Custom(String::from(
                Shiden34Error::Unauthorized.as_str(),
            )));
        }

        let available_to_withdraw = self.get_available_to_withdraw_launchpad_internal();

        self.data::<Data>().withdrawn_sales_launchpad += available_to_withdraw;

        Self::env()
            .transfer(caller_id, available_to_withdraw)
            .map_err(|_| {
                PSP34Error::Custom(String::from(Shiden34Error::WithdrawalFailed.as_str()))
            })?;
        return Ok(());
    }

    default fn withdraw_project(&mut self) -> Result<(), PSP34Error> {
        let caller_id = Self::env().caller();

        if caller_id != self.data::<Data>().project_treasury.unwrap() {
            return Err(PSP34Error::Custom(String::from(
                Shiden34Error::Unauthorized.as_str(),
            )));
        }

        let available_to_withdraw = self.get_available_to_withdraw_project_internal();

        self.data::<Data>().withdrawn_sales_project += available_to_withdraw;

        Self::env()
            .transfer(caller_id, available_to_withdraw)
            .map_err(|_| {
                PSP34Error::Custom(String::from(Shiden34Error::WithdrawalFailed.as_str()))
            })?;
        return Ok(());
    }

    default fn get_available_to_withdraw_launchpad(&self) -> Balance {
        self.get_available_to_withdraw_launchpad_internal()
    }

    default fn get_available_to_withdraw_project(&self) -> Balance {
        self.get_available_to_withdraw_project_internal()
    }

    default fn refund(&mut self, token_id: u64) -> Result<u128, PSP34Error> {
        let caller_id = Self::env().caller();

        if caller_id != self._owner_of(&Id::U64(token_id)).unwrap() {
            return Err(PSP34Error::Custom(String::from(
                Shiden34Error::Unauthorized.as_str(),
            )));
        }

        let (refund_amount, price) = self.get_refund_amount_and_price_internal(token_id);

        if refund_amount == 0 {
            return Err(PSP34Error::Custom(String::from(
                Shiden34Error::RefundFailed.as_str(),
            )));
        } else {
            let refund_address = self.data::<Data>().refund_address.unwrap();
            let res = self._transfer_token(refund_address, Id::U64(token_id), Vec::new());
            match res {
                Ok(_) => {
                    self.data::<Data>().minting_type_for_token.remove(token_id);

                    Self::env()
                        .transfer(caller_id, refund_amount)
                        .map_err(|_| {
                            PSP34Error::Custom(String::from(
                                Shiden34Error::WithdrawalFailed.as_str(),
                            ))
                        })?;
                    self._emit_refund_event(
                        caller_id,
                        refund_address,
                        Some(Id::U64(token_id)),
                        price,
                        refund_amount,
                    );
                    self.data::<Data>().total_refund += refund_amount;
                }
                _ => (),
            };
            return Ok(refund_amount);
        }
    }

    /// Set max number of tokens which could be minted per call
    #[modifiers(only_owner)]
    default fn set_max_mint_amount(&mut self, max_amount: u64) -> Result<(), PSP34Error> {
        self.data::<Data>().max_amount = max_amount;

        Ok(())
    }

    default fn max_supply(&self) -> u64 {
        self.data::<Data>().max_supply
    }

    /// Get token price
    default fn price(&self) -> Balance {
        self.data::<Data>().price_per_mint
    }

    /// Get max number of tokens which could be minted per call
    default fn get_max_mint_amount(&mut self) -> u64 {
        self.data::<Data>().max_amount
    }

    default fn get_refund_amount(&self, token_id: u64) -> Balance {
        self.get_refund_amount_and_price_internal(token_id).0
    }

    #[modifiers(only_owner)]
    default fn add_account_to_prepresale(
        &mut self,
        account_id: AccountId,
        mint_amount: u64,
    ) -> Result<(), PSP34Error> {
        self.data::<Data>()
            .prepresale_whitelisted
            .insert(account_id, &mint_amount);
        Ok(())
    }

    #[modifiers(only_owner)]
    fn add_account_to_prepresale_batch(
        &mut self,
        account_id_mint_amounts: Vec<(AccountId, u64)>,
    ) -> Result<(), PSP34Error> {
        for (account_id, mint_amount) in account_id_mint_amounts {
            self.data::<Data>()
                .prepresale_whitelisted
                .insert(account_id, &mint_amount);
        }
        Ok(())
    }

    #[modifiers(only_owner)]
    fn add_account_to_presale_batch(
        &mut self,
        account_id_mint_amounts: Vec<(AccountId, u64)>,
    ) -> Result<(), PSP34Error> {
        for (account_id, mint_amount) in account_id_mint_amounts {
            self.data::<Data>()
                .presale_whitelisted
                .insert(account_id, &mint_amount);
        }
        Ok(())
    }

    #[modifiers(only_owner)]
    default fn add_account_to_presale(
        &mut self,
        account_id: AccountId,
        mint_amount: u64,
    ) -> Result<(), PSP34Error> {
        self.data::<Data>()
            .presale_whitelisted
            .insert(account_id, &mint_amount);
        Ok(())
    }

    #[modifiers(only_owner)]
    default fn set_minting_status(
        &mut self,
        minting_status_index: Option<u8>,
    ) -> Result<(), PSP34Error> {
        self.data::<Data>().forced_minting_status = minting_status_index;
        return Ok(());
    }

    #[modifiers(only_owner)]
    default fn set_refund_periods(
        &mut self,
        refund_periods: Vec<MilliSeconds>,
    ) -> Result<(), PSP34Error> {
        if self.data::<Data>().refund_periods.len() != refund_periods.len() {
            return Err(PSP34Error::Custom(String::from("InvalidInput")));
        }

        self.data::<Data>().refund_periods = refund_periods;
        Ok(())
    }

    default fn get_minting_status(&self) -> String {
        let minting_status = self.get_current_minting_status();
        match minting_status {
            MintingStatus::Closed => return "closed".as_bytes().to_vec(),
            MintingStatus::Prepresale => return "prepresale".as_bytes().to_vec(),
            MintingStatus::Presale => return "presale".as_bytes().to_vec(),
            MintingStatus::Public => return "public".as_bytes().to_vec(),
            MintingStatus::End => return "end".as_bytes().to_vec(),
        }
    }

    default fn _emit_refund_event(
        &self,
        _from: AccountId,
        _to: AccountId,
        _id: Option<Id>,
        _price: Balance,
        _refunded: Balance,
    ) {
    }

    default fn get_account_prepresale_minting_amount(&self, account_id: AccountId) -> u64 {
        self.data::<Data>()
            .prepresale_whitelisted
            .get(account_id)
            .unwrap_or(0)
    }

    default fn get_account_presale_minting_amount(&self, account_id: AccountId) -> u64 {
        self.data::<Data>()
            .presale_whitelisted
            .get(account_id)
            .unwrap_or(0)
    }

    default fn get_prepresale_start_at(&self) -> u64 {
        self.data::<Data>().prepresale_start_at
    }

    default fn get_presale_start_at(&self) -> u64 {
        self.data::<Data>().presale_start_at
    }

    default fn get_public_sale_start_at(&self) -> u64 {
        self.data::<Data>().public_sale_start_at
    }

    default fn get_public_sale_end_at(&self) -> u64 {
        self.data::<Data>().public_sale_end_at
    }

    default fn prepresale_price(&self) -> Balance {
        self.data::<Data>().prepresale_price_per_mint
    }

    default fn presale_price(&self) -> Balance {
        self.data::<Data>().presale_price_per_mint
    }

    default fn get_refund_periods(&self) -> Vec<MilliSeconds> {
        self.data::<Data>().refund_periods.to_vec()
    }

    default fn get_refund_shares(&self) -> Vec<Percentage> {
        self.data::<Data>().refund_shares.to_vec()
    }

    default fn get_refund_address(&self) -> AccountId {
        self.data::<Data>().refund_address.unwrap()
    }

    default fn get_launchpad_fee(&self) -> Percentage {
        self.data::<Data>().launchpad_fee
    }

    default fn get_project_treasury_address(&self) -> AccountId {
        self.data::<Data>().project_treasury.unwrap()
    }

    default fn get_launchpad_treasury_address(&self) -> AccountId {
        self.data::<Data>().launchpad_treasury.unwrap()
    }
}

/// Helper trait for Launchpad
impl<T> Internal for T
where
    T: Storage<Data> + Storage<psp34::Data<enumerable::Balances>>,
{
    /// Check if the transferred mint values is as expected
    default fn check_value(
        &self,
        transferred_value: u128,
        mint_amount: u64,
        minting_status: &MintingStatus,
    ) -> Result<(), PSP34Error> {
        let price = match minting_status {
            MintingStatus::Prepresale => self.data::<Data>().prepresale_price_per_mint,
            MintingStatus::Presale => self.data::<Data>().presale_price_per_mint,
            MintingStatus::Public => self.data::<Data>().price_per_mint,
            _ => {
                return Err(PSP34Error::Custom(String::from(
                    Shiden34Error::UnableToMint.as_str(),
                )))
            }
        };

        if let Some(value) = (mint_amount as u128).checked_mul(price) {
            if transferred_value == value {
                return Ok(());
            }
        }
        return Err(PSP34Error::Custom(String::from(
            Shiden34Error::BadMintValue.as_str(),
        )));
    }

    /// Check amount of tokens to be minted
    default fn check_amount(&self, mint_amount: u64) -> Result<(), PSP34Error> {
        if mint_amount == 0 {
            return Err(PSP34Error::Custom(String::from(
                Shiden34Error::CannotMintZeroTokens.as_str(),
            )));
        }
        if mint_amount > self.data::<Data>().max_amount {
            return Err(PSP34Error::Custom(String::from(
                Shiden34Error::TooManyTokensToMint.as_str(),
            )));
        }
        let token_left = self.data::<Data>().token_set.len().clone() as u64;
        if mint_amount <= token_left {
            return Ok(());
        }
        return Err(PSP34Error::Custom(String::from(
            Shiden34Error::CollectionIsFull.as_str(),
        )));
    }

    default fn get_pseudo_random(&mut self, max_value: u64) -> u64 {
        let seed = Self::env().block_timestamp();
        let mut input: Vec<u8> = Vec::new();
        input.extend_from_slice(&seed.to_be_bytes());
        input.extend_from_slice(&self.data::<Data>().pseudo_random_salt.to_be_bytes());
        let mut output = <hash::Keccak256 as hash::HashOutput>::Type::default();
        hash_bytes::<hash::Keccak256>(&input, &mut output);
        self.data::<Data>().pseudo_random_salt += 1;

        // hacky, have to find another way
        let number = (output[0] as u64 * output[1] as u64) % (max_value + 1);
        number
    }

    default fn get_mint_id(&mut self) -> u64 {
        let token_length = self.data::<Data>().token_set.len().clone() as u64;
        let token_set_idx = self.get_pseudo_random(token_length - 1);
        self.data::<Data>()
            .token_set
            .swap_remove(token_set_idx as usize)
    }

    default fn check_and_update_allowed_to_mint(
        &mut self,
        account_id: AccountId,
        mint_amount: u64,
        minting_status: &MintingStatus,
    ) -> Result<(), PSP34Error> {
        match minting_status {
            MintingStatus::Closed => {
                return Err(PSP34Error::Custom(String::from(
                    Shiden34Error::UnableToMint.as_str(),
                )))
            }
            MintingStatus::End => {
                return Err(PSP34Error::Custom(String::from(
                    Shiden34Error::UnableToMint.as_str(),
                )))
            }
            MintingStatus::Prepresale => {
                let mint_slot = self
                    .data::<Data>()
                    .prepresale_whitelisted
                    .get(account_id)
                    .unwrap_or(0);

                if mint_slot < mint_amount {
                    return Err(PSP34Error::Custom(String::from(
                        Shiden34Error::UnableToMint.as_str(),
                    )));
                }
                self.data::<Data>()
                    .prepresale_whitelisted
                    .insert(account_id, &(mint_slot - mint_amount));
            }
            MintingStatus::Presale => {
                let mint_slot = self
                    .data::<Data>()
                    .presale_whitelisted
                    .get(account_id)
                    .unwrap_or(0);

                if mint_slot < mint_amount {
                    return Err(PSP34Error::Custom(String::from(
                        Shiden34Error::UnableToMint.as_str(),
                    )));
                }
                self.data::<Data>()
                    .presale_whitelisted
                    .insert(account_id, &(mint_slot - mint_amount));
            }
            MintingStatus::Public => {
                return Ok(());
            }
        }

        return Ok(());
    }

    default fn get_refund_amount_and_price_internal(&self, token_id: u64) -> (Balance, Balance) {
        let minting_status = self.get_current_minting_status();
        if minting_status != MintingStatus::End {
            return (0, 0);
        }

        let minting_type_index = self.data::<Data>().minting_type_for_token.get(token_id);
        if minting_type_index.is_none() {
            return (0, 0);
        }
        let current_timestamp = Self::env().block_timestamp();

        let price: u128 = if minting_type_index.unwrap() == 1 {
            self.data::<Data>().prepresale_price_per_mint
        } else if minting_type_index.unwrap() == 2 {
            self.data::<Data>().presale_price_per_mint
        } else {
            self.data::<Data>().price_per_mint
        };

        for (i, refund_period) in self.data::<Data>().refund_periods.iter().enumerate() {
            if current_timestamp < (self.data::<Data>().public_sale_end_at + refund_period) {
                let refund_share: Balance =
                    *self.data::<Data>().refund_shares.get(i).unwrap_or(&100);

                let refund_amount: Balance = (price * refund_share).saturating_div(100); // TO DO: check accuracy

                return (refund_amount, price);
            }
        }

        return (0, 0);
    }

    default fn get_current_minting_status(&self) -> MintingStatus {
        if let Some(minting_status) = self.data::<Data>().forced_minting_status {
            return MintingStatus::from(minting_status);
        }
        let current_timestamp = Self::env().block_timestamp();

        if current_timestamp > self.data::<Data>().public_sale_end_at
            || u128::from(self.data::<Data>().max_supply)
                == self
                    .data::<psp34::Data<enumerable::Balances>>()
                    .total_supply()
        {
            // or if token supply abis
            return MintingStatus::End;
        } else if current_timestamp > self.data::<Data>().public_sale_start_at {
            return MintingStatus::Public;
        } else if current_timestamp > self.data::<Data>().presale_start_at {
            return MintingStatus::Presale;
        } else if current_timestamp > self.data::<Data>().prepresale_start_at {
            return MintingStatus::Prepresale;
        } else {
            return MintingStatus::Closed;
        }
    }
    fn get_available_to_withdraw_launchpad_internal(&self) -> Balance {
        let minting_status = self.get_current_minting_status();
        if minting_status != MintingStatus::End {
            return 0;
        }

        let total_withdraw_share = self.get_total_withdraw_share_internal();
        let launchpad_share =
            (total_withdraw_share * self.data::<Data>().launchpad_fee).saturating_div(100);

        launchpad_share - self.data::<Data>().withdrawn_sales_launchpad
    }

    fn get_available_to_withdraw_project_internal(&self) -> Balance {
        let minting_status = self.get_current_minting_status();
        if minting_status != MintingStatus::End {
            return 0;
        }

        let total_withdraw_share = self.get_total_withdraw_share_internal();
        let project_share =
            (total_withdraw_share * (100 - self.data::<Data>().launchpad_fee)).saturating_div(100);

        project_share - self.data::<Data>().withdrawn_sales_project
    }

    fn get_total_withdraw_share_internal(&self) -> u128 {
        let current_timestamp = Self::env().block_timestamp();

        let mut total_withdraw_share: u128 = 0;

        if current_timestamp
            > (self.data::<Data>().public_sale_end_at
                + self.data::<Data>().refund_periods.last().unwrap())
        {
            total_withdraw_share =
                self.data::<Data>().total_sales - self.data::<Data>().total_refund;
        } else {
            for (i, refund_period) in self.data::<Data>().refund_periods.iter().enumerate() {
                if current_timestamp < (self.data::<Data>().public_sale_end_at + refund_period) {
                    let non_refundable_percentage: Balance =
                        100 - *self.data::<Data>().refund_shares.get(i).unwrap_or(&100);

                    total_withdraw_share = (non_refundable_percentage
                        * self.data::<Data>().total_sales)
                        .saturating_div(100);
                    break;
                }
            }
        }
        return total_withdraw_share;
    }
}
