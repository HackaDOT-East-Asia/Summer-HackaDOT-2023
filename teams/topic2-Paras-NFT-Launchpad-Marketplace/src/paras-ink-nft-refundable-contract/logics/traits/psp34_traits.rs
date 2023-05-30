use ink::prelude::string::String as PreludeString;
use ink::prelude::vec::Vec;

use openbrush::contracts::psp34::{Id, PSP34Error};

#[openbrush::wrapper]
pub type Psp34TraitsRef = dyn Psp34Traits;

#[openbrush::trait_definition]
pub trait Psp34Traits {
    /// Set new value for the baseUri
    #[ink(message)]
    fn set_base_uri(&mut self, uri: PreludeString) -> Result<(), PSP34Error>;

    #[ink(message)]
    fn set_multiple_attributes(
        &mut self,
        token_id: Id,
        metadata: Vec<(PreludeString, PreludeString)>,
    ) -> Result<(), PSP34Error>;

    /// This function returns all available attributes of each NFT
    #[ink(message)]
    fn get_attributes(&self, token_id: Id, attributes: Vec<PreludeString>) -> Vec<PreludeString>;

    /// This function return how many unique attributes in the contract
    #[ink(message)]
    fn get_attribute_count(&self) -> u32;

    /// This function return the attribute name using attribute index. Beacause attributes of an NFT can be set to anything by Contract Owner, AztZero uses this function to get all attributes of an NFT
    #[ink(message)]
    fn get_attribute_name(&self, index: u32) -> PreludeString;

    /// Get URI from token ID
    #[ink(message)]
    fn token_uri(&self, token_id: u64) -> PreludeString;
}
