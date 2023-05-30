use ink::{prelude::string::String as PreludeString, prelude::vec::Vec, storage::Mapping};
use openbrush::traits::AccountId;

use openbrush::traits::Balance;
use openbrush::traits::String;
pub const STORAGE_KEY: u32 = openbrush::storage_unique_key!(Data);

pub type TokenUri = PreludeString;
use scale::{Decode, Encode};

#[derive(Default, Debug)]
#[openbrush::upgradeable_storage(STORAGE_KEY)]
pub struct Data {
    pub last_token_id: u64,
    pub max_amount: u64,
    pub last_token_series_id: u64,
    pub token_series: Mapping<u64, TokenSeriesMetadata>,
    pub token_to_token_series: Mapping<u64, u64>,
    pub marketplace_treasury: Option<AccountId>,
    pub attribute_count: u32,
    pub attribute_names: Mapping<u32, Vec<u8>>,
    pub transaction_fee: u16,
    pub last_collection_id: u64,
    pub collection_to_creator_address: Mapping<u64, AccountId>,
}

#[derive(Encode, Decode, Debug)]
#[cfg_attr(
    feature = "std",
    derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
)]
pub struct TokenSeriesMetadata {
    pub base_uri: TokenUri,
    pub price: Option<Balance>,
    pub royalty: Vec<(AccountId, u32)>,
    pub iterative: bool,
    pub copies: u64,
    pub minted_copies: u64,
    pub collection_id: u64,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum NFTSeriesError {
    BadMintValue,
    CannotMintZeroTokens,
    CollectionIsFull,
    TooManyTokensToMint,
    WithdrawalFailed,
    MintEnd,
    CannotMintMoreThanOnce,
    NotCreator,
    RoyaltyInvalid,
}

impl NFTSeriesError {
    pub fn as_str(&self) -> String {
        match self {
            NFTSeriesError::BadMintValue => String::from("BadMintValue"),
            NFTSeriesError::CannotMintZeroTokens => String::from("CannotMintZeroTokens"),
            NFTSeriesError::CollectionIsFull => String::from("CollectionIsFull"),
            NFTSeriesError::TooManyTokensToMint => String::from("TooManyTokensToMint"),
            NFTSeriesError::WithdrawalFailed => String::from("WithdrawalFailed"),
            NFTSeriesError::MintEnd => String::from("MintEnd"),
            NFTSeriesError::CannotMintMoreThanOnce => String::from("CannotMintMoreThanOnce"),
            NFTSeriesError::NotCreator => String::from("NotCreator"),
            NFTSeriesError::RoyaltyInvalid => String::from("RoyaltyInvalid"),
        }
    }
}
