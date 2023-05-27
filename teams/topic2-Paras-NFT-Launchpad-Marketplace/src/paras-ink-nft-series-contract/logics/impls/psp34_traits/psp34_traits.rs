// Copyright (c) 2022 Astar Network
//
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the"Software"),
// to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

use ink::prelude::{
    string::String as PreludeString,
    vec::Vec,
};

use crate::impls::launchpad::types::Data;
pub use crate::traits::psp34_traits::Psp34Traits;

use openbrush::{
    contracts::{
        ownable::*,
        psp34::extensions::{
            enumerable::*,
            metadata::*,
        },
        reentrancy_guard::*,
    },
    modifiers,
    traits::{
        Storage,
        String,
    },
};

pub trait Internal {
    /// Check if token is minted
    fn token_exists(&self, id: Id) -> Result<(), PSP34Error>;
}

impl<T> Psp34Traits for T
where
    T: Storage<Data>
        + Storage<psp34::Data<enumerable::Balances>>
        + Storage<reentrancy_guard::Data>
        + Storage<ownable::Data>
        + Storage<metadata::Data>
        + psp34::extensions::metadata::PSP34Metadata
        + psp34::Internal,
{
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
        token_id: u64,
        metadata: Vec<(PreludeString, PreludeString)>,
    ) -> Result<(), PSP34Error> {
        if token_id == 0 {
            return Err(PSP34Error::Custom("InvalidInput".as_bytes().to_vec()))
        }
        for (attribute, value) in &metadata {
            add_attribute_name(self, &attribute.clone().into_bytes());
            self._set_attribute(
                Id::U64(token_id),
                attribute.clone().into_bytes(),
                value.clone().into_bytes(),
            );
        }
        Ok(())
    }

    default fn get_attributes(
        &self,
        token_id: u64,
        attributes: Vec<PreludeString>,
    ) -> Vec<PreludeString> {
        let length = attributes.len();
        let mut ret = Vec::<PreludeString>::new();
        for item in attributes.iter().take(length) {
            let value: Option<Vec<u8>> =
                self.get_attribute(Id::U64(token_id), item.clone().into_bytes());
            if let Some(value) = value {
                ret.push(PreludeString::from_utf8(value).unwrap());
            } else {
                ret.push(PreludeString::from(""));
            }
        }
        ret
    }

    default fn get_attribute_count(&self) -> u32 {
        self.data::<Data>().attribute_count
    }

    default fn get_attribute_name(&self, index: u32) -> PreludeString {
        let attribute = self.data::<Data>().attribute_names.get(&index);
        if let Some(attribute) = attribute {
            PreludeString::from_utf8(attribute).unwrap()
        } else {
            PreludeString::from("")
        }
    }

    /// Get URI from token ID
    default fn token_uri(&self, token_id: u64) -> PreludeString {
        let _ = self.token_exists(Id::U64(token_id));
        let value = self.get_attribute(
            self.data::<psp34::Data<enumerable::Balances>>()
                .collection_id(),
            String::from("baseUri"),
        );
        let mut token_uri = PreludeString::from_utf8(value.unwrap()).unwrap();
        token_uri = token_uri + &PreludeString::from("1.json");
        token_uri
    }
}

fn add_attribute_name<T: Storage<Data>>(instance: &mut T, attribute_input: &Vec<u8>) {
    let mut exist: bool = false;
    for index in 0..instance.data::<Data>().attribute_count {
        let attribute_name = instance.data::<Data>().attribute_names.get(&(index + 1));
        if attribute_name.is_some() && attribute_name.unwrap() == *attribute_input {
            exist = true;
            break
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

impl<T> Internal for T
where
    T: Storage<Data> + Storage<psp34::Data<enumerable::Balances>>,
{
    /// Check if token is minted
    default fn token_exists(&self, id: Id) -> Result<(), PSP34Error> {
        self.data::<psp34::Data<enumerable::Balances>>()
            .owner_of(id)
            .ok_or(PSP34Error::TokenNotExists)?;
        Ok(())
    }
}
