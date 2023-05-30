use crate::impls::marketplace::types::{MarketplaceError, NftContractType, RegisteredCollection};
use ink::prelude::vec::Vec;
use openbrush::{
    contracts::psp34::Id,
    traits::{AccountId, Balance, Hash, String},
};

#[openbrush::trait_definition]
pub trait MarketplaceSale {
    /// Sets a hash of a Shiden34 contract to be instantiated by factory call.
    #[ink(message)]
    fn set_nft_contract_hash(
        &mut self,
        contract_type: NftContractType,
        contract_hash: Hash,
    ) -> Result<(), MarketplaceError>;

    /// Gets a NFT contract hash.
    #[ink(message)]
    fn nft_contract_hash(&self, contract_type: NftContractType) -> Hash;

    /// Creates a NFT item sale on the marketplace.
    #[ink(message)]
    fn list(
        &mut self,
        contract_address: AccountId,
        token_id: Id,
        price: Balance,
    ) -> Result<(), MarketplaceError>;

    /// Removes a NFT from the marketplace sale.
    #[ink(message)]
    fn unlist(&mut self, contract_address: AccountId, token_id: Id)
        -> Result<(), MarketplaceError>;

    /// Buys NFT item from the marketplace.
    #[ink(message, payable)]
    fn buy(&mut self, contract_address: AccountId, token_id: Id) -> Result<(), MarketplaceError>;

    /// Registers NFT collection to the marketplace.
    #[ink(message)]
    fn register(
        &mut self,
        contract_address: AccountId,
        royalty_receiver: Option<AccountId>,
        royalty: Option<u16>,
        contract_type: NftContractType,
    ) -> Result<(), MarketplaceError>;

    /// Gets registered collection.
    #[ink(message)]
    fn get_registered_collection(
        &self,
        contract_address: AccountId,
    ) -> Option<RegisteredCollection>;

    /// Sets the marketplace fee.
    #[ink(message)]
    fn set_marketplace_fee(&mut self, fee: u16) -> Result<(), MarketplaceError>;

    /// Gets the marketplace fee.
    #[ink(message)]
    fn get_marketplace_fee(&self) -> u16;

    /// Gets max fee that can be applied to an item price.
    #[ink(message)]
    fn get_max_fee(&self) -> u16;

    /// Checks if NFT token is listed on the marketplace and returns token price.
    #[ink(message)]
    fn get_price(&self, contract_address: AccountId, token_id: Id) -> Option<Balance>;

    /// Gets the marketplace fee recipient.
    #[ink(message)]
    fn get_fee_recipient(&self) -> AccountId;

    /// Sets the marketplace fee recipient.
    #[ink(message)]
    fn set_fee_recipient(&mut self, fee_recipient: AccountId) -> Result<(), MarketplaceError>;

    /// Deposit balance for offer
    #[ink(message, payable)]
    fn deposit(&mut self) -> Result<(), MarketplaceError>;

    /// Withdraw balance for offer
    #[ink(message)]
    fn withdraw(&mut self, amount: Balance) -> Result<(), MarketplaceError>;

    // Get deposited balance
    #[ink(message)]
    fn get_deposit(&self, account_id: AccountId) -> Balance;

    // Make offer to a specific contract and/or token_id. Returns offer_id, so duplicate offer is possible
    #[ink(message)]
    fn make_offer(
        &mut self,
        contract_address: AccountId,
        token_id: Option<Id>,
        quantity: u64,
        price_per_item: u128,
        extra: String,
    ) -> Result<u128, MarketplaceError>;

    // Cancel a specific offer
    #[ink(message)]
    fn cancel_offer(&mut self, offer_id: u128) -> Result<(), MarketplaceError>;

    #[ink(message)]
    fn get_offer_for_token(
        &self,
        contract_address: AccountId,
        token_id: Option<Id>,
    ) -> Result<Vec<u128>, MarketplaceError>;

    // Check offer is active, balance >= quantity * amount
    #[ink(message)]
    fn get_offer_active(&self, offer_id: u128) -> bool;

    // Accept offer
    #[ink(message)]
    fn accept_offer(&mut self, offer_id: u128, token_id: Id) -> Result<(), MarketplaceError>;

    // Accept offer for admin, for the ones with extras
    #[ink(message)]
    fn fulfill_offer(&mut self, offer_id: u128, token_id: Id) -> Result<(), MarketplaceError>;
}
