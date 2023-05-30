use ink::prelude::string::{String as PreludeString, ToString};

use crate::impls::launchpad::types::Data;
pub use crate::traits::psp34_traits::Psp34Traits;

use ink::prelude::vec::Vec;
use openbrush::{
    contracts::{
        ownable::*,
        psp34::extensions::{enumerable::*, metadata::*},
    },
    modifiers,
    traits::{Storage, String},
};

pub trait Internal {
    fn token_exists(&self, id: Id) -> Result<(), PSP34Error>;
}

impl<T> Internal for T
where
    T: Storage<psp34::Data<enumerable::Balances>>,
{
    /// Check if token is minted
    default fn token_exists(&self, id: Id) -> Result<(), PSP34Error> {
        self.data::<psp34::Data<enumerable::Balances>>()
            .owner_of(id)
            .ok_or(PSP34Error::TokenNotExists)?;
        Ok(())
    }
}

impl<T> Psp34Traits for T
where
    T: Storage<psp34::Data<enumerable::Balances>>
        + Storage<ownable::Data>
        + Storage<metadata::Data>
        + psp34::extensions::metadata::PSP34Metadata
        + Storage<Data>,
{
    /// Get URI from token ID
    default fn token_uri(&self, token_id: u64) -> PreludeString {
        let value = self.get_attribute(
            self.data::<psp34::Data<enumerable::Balances>>()
                .collection_id(),
            String::from("baseUri"),
        );
        let mut token_uri = PreludeString::from_utf8(value.unwrap()).unwrap();
        token_uri = token_uri + &token_id.to_string() + &PreludeString::from(".json");
        token_uri
    }

    /// Set new value for the baseUri
    #[modifiers(only_owner)]
    default fn set_base_uri(&mut self, uri: PreludeString) -> Result<(), PSP34Error> {
        let id = self
            .data::<psp34::Data<enumerable::Balances>>()
            .collection_id();
        self.data::<metadata::Data>()
            ._set_attribute(id, String::from("baseUri"), uri.into_bytes());
        Ok(())
    }

    /// Only Owner can set multiple attributes to a token
    #[modifiers(only_owner)]
    default fn set_multiple_attributes(
        &mut self,
        token_id: Id,
        metadata: Vec<(PreludeString, PreludeString)>,
    ) -> Result<(), PSP34Error> {
        if token_id == Id::U64(0) {
            return Err(PSP34Error::Custom("InvalidInput".as_bytes().to_vec()));
        }
        for (attribute, value) in &metadata {
            add_attribute_name(self, &attribute.clone().into_bytes());
            self._set_attribute(
                token_id.clone(),
                attribute.clone().into_bytes(),
                value.clone().into_bytes(),
            );
        }
        Ok(())
    }

    /// Get multiple  attributes
    default fn get_attributes(
        &self,
        token_id: Id,
        attributes: Vec<PreludeString>,
    ) -> Vec<PreludeString> {
        let length = attributes.len();
        let mut ret = Vec::<PreludeString>::new();
        for item in attributes.iter().take(length) {
            let value = self.get_attribute(token_id.clone(), item.clone().into_bytes());
            if let Some(value) = value {
                ret.push(PreludeString::from_utf8(value).unwrap());
            } else {
                ret.push(PreludeString::from(""));
            }
        }
        ret
    }

    /// Get Attribute Count
    default fn get_attribute_count(&self) -> u32 {
        self.data::<Data>().attribute_count
    }
    /// Get Attribute Name
    default fn get_attribute_name(&self, index: u32) -> PreludeString {
        let attribute = self.data::<Data>().attribute_names.get(&index);
        if let Some(attribute) = attribute {
            PreludeString::from_utf8(attribute).unwrap()
        } else {
            PreludeString::from("")
        }
    }
}

fn add_attribute_name<T: Storage<Data>>(instance: &mut T, attribute_input: &Vec<u8>) {
    let mut exist: bool = false;
    for index in 0..instance.data::<Data>().attribute_count {
        let attribute_name = instance.data::<Data>().attribute_names.get(&(index + 1));
        if attribute_name.is_some() && attribute_name.unwrap() == *attribute_input {
            exist = true;
            break;
        }
    }
    if !exist {
        instance.data::<Data>().attribute_count = instance
            .data::<Data>()
            .attribute_count
            .checked_add(1)
            .unwrap();
        let data = &mut instance.data::<Data>();
        data.attribute_names
            .insert(&data.attribute_count, attribute_input);
    }
}
