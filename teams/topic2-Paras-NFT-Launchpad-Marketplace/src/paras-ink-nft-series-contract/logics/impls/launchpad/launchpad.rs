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
    Data,
    NFTError,
};
pub use crate::traits::launchpad::Launchpad;

use openbrush::{
    contracts::{
        ownable::*,
        psp34::extensions::{
            enumerable::*,
            metadata::*,
        },
        reentrancy_guard::*,
    },
    modifiers,
    traits::{
        AccountId,
        Storage,
        String,
    },
};

pub trait Internal {
    /// Check amount of tokens to be minted
    fn check_amount(&self, mint_amount: u64) -> Result<(), PSP34Error>;
}

impl<T> Launchpad for T
where
    T: Storage<Data>
        + Storage<psp34::Data<enumerable::Balances>>
        + Storage<reentrancy_guard::Data>
        + Storage<ownable::Data>
        + Storage<metadata::Data>
        + psp34::extensions::metadata::PSP34Metadata
        + psp34::Internal,
{
    /// Mint one or more tokens
    #[modifiers(non_reentrant)]
    default fn mint(&mut self, to: AccountId, mint_amount: u64) -> Result<(), PSP34Error> {
        self.check_amount(mint_amount)?;
        let caller = Self::env().caller();

        if self
            .data::<Data>()
            .account_minted
            .get(caller)
            .unwrap_or(false)
            == true
        {
            return Err(PSP34Error::Custom(String::from(
                NFTError::CannotMintMoreThanOnce.as_str(),
            )))
        }

        if self.data::<Data>().mint_end == true {
            return Err(PSP34Error::Custom(String::from(NFTError::MintEnd.as_str())))
        }

        let next_to_mint = self.data::<Data>().last_token_id + 1;
        let mint_offset = next_to_mint + mint_amount;

        for mint_id in next_to_mint..mint_offset {
            self.data::<psp34::Data<enumerable::Balances>>()
                ._mint_to(to, Id::U64(mint_id))?;
            self._emit_transfer_event(None, Some(to), Id::U64(mint_id));
            self.data::<Data>().last_token_id += 1;
        }

        self.data::<Data>().account_minted.insert(caller, &true);
        Ok(())
    }

    /// Mint next available token for the caller
    default fn mint_next(&mut self) -> Result<(), PSP34Error> {
        let caller = Self::env().caller();
        if self
            .data::<Data>()
            .account_minted
            .get(caller)
            .unwrap_or(false)
            == true
        {
            return Err(PSP34Error::Custom(String::from(
                NFTError::CannotMintMoreThanOnce.as_str(),
            )))
        }

        if self.data::<Data>().mint_end == true {
            return Err(PSP34Error::Custom(String::from(NFTError::MintEnd.as_str())))
        }

        let token_id =
            self.data::<Data>()
                .last_token_id
                .checked_add(1)
                .ok_or(PSP34Error::Custom(String::from(
                    NFTError::CollectionIsFull.as_str(),
                )))?;

        self.data::<psp34::Data<enumerable::Balances>>()
            ._mint_to(caller, Id::U64(token_id))?;

        self._emit_transfer_event(None, Some(caller), Id::U64(token_id));

        self.data::<Data>().account_minted.insert(caller, &true);
        self.data::<Data>().last_token_id += 1;
        return Ok(())
    }

    /// Withdraws funds to contract owner
    #[modifiers(only_owner)]
    default fn withdraw(&mut self) -> Result<(), PSP34Error> {
        let balance = Self::env().balance();
        let current_balance = balance
            .checked_sub(Self::env().minimum_balance())
            .unwrap_or_default();
        Self::env()
            .transfer(self.data::<ownable::Data>().owner(), current_balance)
            .map_err(|_| PSP34Error::Custom(String::from(NFTError::WithdrawalFailed.as_str())))?;
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
    default fn get_max_mint_amount(&mut self) -> u64 {
        self.data::<Data>().max_amount
    }

    default fn get_is_account_minted(&self, account_id: AccountId) -> bool {
        self.data::<Data>()
            .account_minted
            .get(account_id)
            .unwrap_or(false)
    }

    default fn get_mint_end(&self) -> bool {
        self.data::<Data>().mint_end
    }

    #[modifiers(only_owner)]
    default fn set_mint_end(&mut self, status: bool) -> Result<(), PSP34Error> {
        self.data::<Data>().mint_end = status;
        Ok(())
    }
}

/// Helper trait for Launchpad
impl<T> Internal for T
where
    T: Storage<Data> + Storage<psp34::Data<enumerable::Balances>>,
{
    /// Check amount of tokens to be minted
    default fn check_amount(&self, mint_amount: u64) -> Result<(), PSP34Error> {
        if mint_amount == 0 {
            return Err(PSP34Error::Custom(String::from(
                NFTError::CannotMintZeroTokens.as_str(),
            )))
        }
        if mint_amount > self.data::<Data>().max_amount {
            return Err(PSP34Error::Custom(String::from(
                NFTError::TooManyTokensToMint.as_str(),
            )))
        }

        return Ok(())
    }
}
