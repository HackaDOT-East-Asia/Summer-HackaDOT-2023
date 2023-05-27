use ink::{
    prelude::vec::Vec,
    storage::Mapping,
};
use openbrush::traits::AccountId;

use openbrush::traits::String;
pub const STORAGE_KEY: u32 = openbrush::storage_unique_key!(Data);

#[derive(Default, Debug)]
#[openbrush::upgradeable_storage(STORAGE_KEY)]
pub struct Data {
    pub last_token_id: u64,
    pub collection_id: u32,
    pub max_amount: u64,
    pub account_minted: Mapping<AccountId, bool>,
    pub mint_end: bool,
    pub attribute_count: u32,
    pub attribute_names: Mapping<u32, Vec<u8>>,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum NFTError {
    BadMintValue,
    CannotMintZeroTokens,
    CollectionIsFull,
    TooManyTokensToMint,
    WithdrawalFailed,
    MintEnd,
    CannotMintMoreThanOnce,
}

impl NFTError {
    pub fn as_str(&self) -> String {
        match self {
            NFTError::BadMintValue => String::from("BadMintValue"),
            NFTError::CannotMintZeroTokens => String::from("CannotMintZeroTokens"),
            NFTError::CollectionIsFull => String::from("CollectionIsFull"),
            NFTError::TooManyTokensToMint => String::from("TooManyTokensToMint"),
            NFTError::WithdrawalFailed => String::from("WithdrawalFailed"),
            NFTError::MintEnd => String::from("MintEnd"),
            NFTError::CannotMintMoreThanOnce => String::from("CannotMintMoreThanOnce"),
        }
    }
}
