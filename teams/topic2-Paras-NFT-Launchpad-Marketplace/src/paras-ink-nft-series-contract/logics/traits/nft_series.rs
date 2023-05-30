use ink::prelude::string::String as PreludeString;
use ink::prelude::vec::Vec;
use openbrush::{
    contracts::psp34::PSP34Error,
    traits::{AccountId, Balance},
};

use crate::impls::nft_series::types::{NFTSeriesError, TokenSeriesMetadata};

#[openbrush::wrapper]
pub type NFTSeriesRef = dyn NFTSeries;

#[openbrush::trait_definition]
pub trait NFTSeries {
    /// Create collection
    #[ink(message)]
    fn nft_create_collection(
        &mut self,
        title: Option<PreludeString>,
        description: Option<PreludeString>,
        media: Option<PreludeString>,
        cover: Option<PreludeString>,
        twitter: Option<PreludeString>,
        website: Option<PreludeString>,
    ) -> Result<u64, NFTSeriesError>;

    /// Buy one or more tokens
    #[ink(message)]
    fn nft_create_series(
        &mut self,
        collection_id: u64,
        base_uri: PreludeString,
        price: Option<Balance>,
        copies: u64,
        royalty: Vec<(AccountId, u32)>,
        iterative: bool,
    ) -> Result<u64, NFTSeriesError>;

    /// Buy one or more tokens
    #[ink(message, payable)]
    fn nft_buy(
        &mut self,
        token_series_id: u64,
        receiver_address: Option<AccountId>,
    ) -> Result<u64, PSP34Error>;

    /// Mint for creator
    #[ink(message)]
    fn nft_mint(
        &mut self,
        token_series_id: u64,
        receiver_address: AccountId,
    ) -> Result<u64, PSP34Error>;

    /// Mint and approve for creator
    #[ink(message)]
    fn nft_mint_and_approve(
        &mut self,
        token_series_id: u64,
        account_address: AccountId,
    ) -> Result<(), PSP34Error>;

    /// Decrease copies
    #[ink(message)]
    fn nft_decrease_series_copies(
        &mut self,
        token_series_id: u64,
        decrease_copies: u16,
    ) -> Result<(), NFTSeriesError>;

    /// Set series price
    #[ink(message)]
    fn nft_set_series_price(
        &mut self,
        token_series_id: u64,
        price: Option<Balance>,
    ) -> Result<(), NFTSeriesError>;

    /// Set max number of tokens which could be minted per call
    #[ink(message)]
    fn set_max_mint_amount(&mut self, max_amount: u64) -> Result<(), PSP34Error>;

    /// Get max supply of tokens
    #[ink(message)]
    fn max_supply(&self) -> u64;

    /// Get max number of tokens which could be minted per call
    #[ink(message)]
    fn get_max_mint_amount(&self) -> u64;

    /// Get transaction fee
    #[ink(message)]
    fn get_transaction_fee(&self) -> u16;

    /// Get token_series from token_id
    #[ink(message)]
    fn get_token_series(&self, token_id: u64) -> Option<u64>;

    /// Get series metadata
    #[ink(message)]
    fn get_series(&self, token_series_id: u64) -> TokenSeriesMetadata;

    /// Get token royalty info https://eips.ethereum.org/EIPS/eip-2981
    #[ink(message)]
    fn royalty_info(
        &self,
        token_id: u64,
        sale_price: Balance,
    ) -> Result<Vec<(AccountId, Balance)>, PSP34Error>;

    fn _emit_nft_create_series(
        &self,
        token_series_id: u64,
        base_uri: PreludeString,
        price: Option<Balance>,
        supply: u64,
        royalty: Vec<(AccountId, u32)>,
        iterative: bool,
        creator_address: AccountId,
        collection_id: u64,
    );

    fn _emit_set_series_price(&self, token_series_id: u64, price: Option<Balance>);
    fn _emit_decrease_series_copies(&self, token_series_id: u64, copies_after: u64);
    fn _emit_nft_create_collection(
        &self,
        collection_id: u64,
        creator_address: AccountId,
        title: Option<PreludeString>,
        description: Option<PreludeString>,
        media: Option<PreludeString>,
        cover: Option<PreludeString>,
        twitter: Option<PreludeString>,
        website: Option<PreludeString>,
    );

    fn _emit_nft_buy(&self, token_series_id: u64, token_id: u64, to: AccountId, price: Balance);
}
