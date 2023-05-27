use ink::prelude::vec::Vec;
use ink::storage::Mapping;
use openbrush::traits::{Balance, String};
pub const STORAGE_KEY: u32 = openbrush::storage_unique_key!(Data);

use ink::primitives::AccountId;
pub type MilliSeconds = u64;
pub type Percentage = u128;
pub type TokenId = u64;
pub type BlockTimestamp = u64;

#[derive(PartialEq)]
pub enum MintingStatus {
    Closed,
    Prepresale,
    Presale,
    Public,
    End,
}

pub type MintingStatusIndex = u8;

impl MintingStatus {
    pub fn to_index(&self) -> u8 {
        match self {
            MintingStatus::Closed => return 0,
            MintingStatus::Prepresale => return 1,
            MintingStatus::Presale => return 2,
            MintingStatus::Public => return 3,
            MintingStatus::End => return 4,
        }
    }

    pub fn from(index: u8) -> Self {
        if index == 0 {
            return MintingStatus::Closed;
        } else if index == 1 {
            return MintingStatus::Prepresale;
        } else if index == 2 {
            return MintingStatus::Presale;
        } else if index == 3 {
            return MintingStatus::Public;
        } else {
            return MintingStatus::End;
        }
    }
}

#[derive(Default, Debug)]
#[openbrush::upgradeable_storage(STORAGE_KEY)]
pub struct Data {
    pub collection_id: u32,
    pub max_supply: u64,
    pub price_per_mint: Balance,
    pub max_amount: u64,
    pub token_set: Vec<u64>,
    pub pseudo_random_salt: u64,
    pub forced_minting_status: Option<u8>,
    pub public_sale_start_at: u64,
    pub public_sale_end_at: u64,
    pub prepresale_start_at: u64,
    pub prepresale_price_per_mint: Balance,
    pub prepresale_whitelisted: Mapping<AccountId, u64>,
    pub presale_start_at: u64,
    pub presale_price_per_mint: Balance,
    pub presale_whitelisted: Mapping<AccountId, u64>,
    pub refund_periods: Vec<MilliSeconds>,
    pub refund_shares: Vec<Percentage>,
    pub refund_address: Option<AccountId>,
    pub minting_type_for_token: Mapping<TokenId, MintingStatusIndex>,
    pub total_sales: Balance,
    pub total_refund: Balance,
    pub withdrawn_sales_project: Balance,
    pub withdrawn_sales_launchpad: Balance,
    pub launchpad_fee: Percentage,
    pub project_treasury: Option<AccountId>,
    pub launchpad_treasury: Option<AccountId>,
    pub attribute_count: u32,
    pub attribute_names: Mapping<u32, Vec<u8>>,
}

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]

pub enum Shiden34Error {
    BadMintValue,
    CannotMintZeroTokens,
    CollectionIsFull,
    TooManyTokensToMint,
    WithdrawalFailed,
    UnableToMint,
    RefundFailed,
    Unauthorized,
}

impl Shiden34Error {
    pub fn as_str(&self) -> String {
        match self {
            Shiden34Error::BadMintValue => String::from("BadMintValue"),
            Shiden34Error::CannotMintZeroTokens => String::from("CannotMintZeroTokens"),
            Shiden34Error::CollectionIsFull => String::from("CollectionIsFull"),
            Shiden34Error::TooManyTokensToMint => String::from("TooManyTokensToMint"),
            Shiden34Error::WithdrawalFailed => String::from("WithdrawalFailed"),
            Shiden34Error::UnableToMint => String::from("UnableToMint"),
            Shiden34Error::RefundFailed => String::from("RefundFailed"),
            Shiden34Error::Unauthorized => String::from("Unauthorized"),
        }
    }
}
