use ink::prelude::vec::Vec;
use openbrush::{
    contracts::{ownable::OwnableError, psp34::Id, reentrancy_guard::ReentrancyGuardError},
    storage::Mapping,
    traits::{AccountId, Balance, Hash, String},
};
use scale::{Decode, Encode};

pub const STORAGE_KEY: u32 = openbrush::storage_unique_key!(Data);

#[derive(Default, Debug)]
#[openbrush::upgradeable_storage(STORAGE_KEY)]
pub struct Data {
    pub registered_collections: Mapping<AccountId, RegisteredCollection>,
    pub items: Mapping<(AccountId, Id), Item>,
    pub fee: u16,
    pub max_fee: u16,
    pub market_fee_recipient: Option<AccountId>,
    pub nft_contract_hash: Mapping<NftContractType, Hash>,
    pub nonce: u64,
    pub deposit: Mapping<AccountId, Balance>,
    pub offer_items: Mapping<u128, OfferItem>,
    pub offer_items_per_contract_token_id: Mapping<(AccountId, Option<Id>), Vec<u128>>,
    pub last_offer_id: u128,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum MarketplaceError {
    /// Caller is not a marketplace owner.
    OwnableError(OwnableError),
    /// Caller is trying to make second call while 1st one is still executing.
    ReentrancyError(ReentrancyGuardError),
    /// Caller is not an NFT owner.
    NotOwner,
    /// A NFT item is not found in a contract.
    ItemNotFound,
    /// A NFT item is not listed for sale
    ItemNotListedForSale,
    /// NFT contract is not registered to the marketplace.
    NotRegisteredContract,
    /// Value send to buy method is invalid
    BadBuyValue,
    /// Fee transfer to the marketplace failed.
    TransferToMarketplaceFailed,
    /// Fee transfer to the marketplace failed.
    TransferToOwnerFailed,
    /// Royalty transfer failed.
    TransferToAuthorFailed,
    /// Contract has been already registered to the marketplace
    ContractAlreadyRegistered,
    /// Fee required is too high.
    FeeTooHigh,
    /// Unable to transfer token to a new owner.
    UnableToTransferToken,
    /// PSP23 contract hash was not set
    NftContractHashNotSet,
    /// Factory method was unable to initiate NFT smart contract.
    ContractInstantiationFailed,
    /// Buyer already owns token.
    AlreadyOwner,
    /// Token does not exist.
    TokenDoesNotExist,
    /// Marketplace item is already listed for sale.
    ItemAlreadyListedForSale,
    /// Deposit balance insufficient
    BalanceInsufficient,
    /// Token not approved
    TokenNotApproved,
    /// For offer, if details do not match
    OfferNotMatch,
    /// For offer, if details do not match
    OfferDoesNotExist,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
pub enum NftContractType {
    Psp34,
    Rmrk,
    NFTSeries,
}

#[derive(Encode, Decode, Debug)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
pub struct RegisteredCollection {
    pub royalty: Option<(AccountId, u16)>,
    pub contract_type: NftContractType,
}

#[derive(Encode, Decode, Debug)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
pub struct Item {
    pub owner: AccountId,
    pub price: Balance,
}

#[derive(Encode, Decode, Debug)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
pub struct OfferItem {
    pub bidder_id: AccountId,
    pub contract_address: AccountId,
    pub token_id: Option<Id>,
    pub quantity: u64,
    pub price_per_item: Balance,
    pub extra: String,
}

impl From<OwnableError> for MarketplaceError {
    fn from(error: OwnableError) -> Self {
        MarketplaceError::OwnableError(error)
    }
}

impl From<ReentrancyGuardError> for MarketplaceError {
    fn from(error: ReentrancyGuardError) -> Self {
        MarketplaceError::ReentrancyError(error)
    }
}
