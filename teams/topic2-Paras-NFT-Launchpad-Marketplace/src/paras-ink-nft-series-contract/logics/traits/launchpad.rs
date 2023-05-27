use openbrush::{
    contracts::psp34::PSP34Error,
    traits::AccountId,
};

#[openbrush::wrapper]
pub type LaunchpadRef = dyn Launchpad;

#[openbrush::trait_definition]
pub trait Launchpad {
    /// Mint one or more tokens
    #[ink(message, payable)]
    fn mint(&mut self, to: AccountId, mint_amount: u64) -> Result<(), PSP34Error>;

    /// Mint next available token for the caller
    #[ink(message, payable)]
    fn mint_next(&mut self) -> Result<(), PSP34Error>;

    /// Withdraws funds to contract owner
    #[ink(message)]
    fn withdraw(&mut self) -> Result<(), PSP34Error>;

    /// Set max number of tokens which could be minted per call
    #[ink(message)]
    fn set_max_mint_amount(&mut self, max_amount: u64) -> Result<(), PSP34Error>;

    /// Get max supply of tokens
    #[ink(message)]
    fn max_supply(&self) -> u64;

    /// Get max number of tokens which could be minted per call
    #[ink(message)]
    fn get_max_mint_amount(&mut self) -> u64;

    #[ink(message)]
    fn set_mint_end(&mut self, status: bool) -> Result<(), PSP34Error>;

    #[ink(message)]
    fn get_mint_end(&self) -> bool;

    #[ink(message)]
    fn get_is_account_minted(&self, account_id: AccountId) -> bool;
}
