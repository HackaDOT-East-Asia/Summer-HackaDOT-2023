use ink::prelude::string::String as PreludeString;
use ink::prelude::vec::Vec;

use openbrush::{
    contracts::psp34::PSP34Error,
};

#[openbrush::wrapper]
pub type Psp34Ref = dyn Psp34Traits;

#[openbrush::trait_definition]
pub trait Psp34Traits {
    #[ink(message)]
    fn set_base_uri(&mut self, uri: PreludeString) -> Result<(), PSP34Error>;

    #[ink(message)]
    fn set_multiple_attributes(&mut self, token_id: u64, metadata: Vec<(PreludeString, PreludeString)>) -> Result<(), PSP34Error>;

    #[ink(message)]
    fn get_attributes(&self, token_id: u64, attributes: Vec<PreludeString>) -> Vec<PreludeString>;

    #[ink(message)]
    fn get_attribute_count(&self) -> u32;

    #[ink(message)]
    fn get_attribute_name(&self, index: u32) -> PreludeString;

    #[ink(message)]
    fn token_uri(&self, token_id: u64) -> PreludeString;
}