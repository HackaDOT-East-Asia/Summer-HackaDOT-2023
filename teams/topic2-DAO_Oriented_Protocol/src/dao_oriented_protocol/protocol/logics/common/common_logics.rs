use ink::prelude::{ vec, vec::Vec };
use ink::prelude::string::{ String, ToString };
use openbrush::traits::AccountId;
pub use crate::traits::errors::contract_error::ContractBaseError;

pub fn convert_string_to_accountid(account_str: &str) -> Option<AccountId> {
    let mut output = vec![0xFF; 35];
    match bs58::decode(account_str).into(&mut output) {
        Ok(_) => (),
        Err(_) => return None,
    };
    let cut_address_vec: Vec<_> = output.drain(1..33).collect();
    let mut array = [0; 32];
    let bytes = &cut_address_vec[..array.len()];
    array.copy_from_slice(bytes);
    let account_id: AccountId = array.into();
    Some(account_id)
}

pub fn convert_hexstring_to_accountid(hex_account_str: String) -> Option<AccountId> {
    match hex::decode(hex_account_str) {
        Ok(value) => {
            let mut array = [0; 32];
            let bytes = &value[..array.len()];
            array.copy_from_slice(bytes);
            let account_id: AccountId = array.into();
            return Some(account_id);
        },
        Err(_) => None,
    }
}

pub fn change_csv_string_to_vec_of_string(parameters_csv: String) ->Vec<String> {
    match parameters_csv.find(',') {
        Some(_index) => parameters_csv
            .split(',')
            .map(|col| col.to_string())
            .collect(),
        None => {
            let mut rec: Vec<String> = Vec::new();
            rec.push(parameters_csv);
            rec
        }
    }
}

pub fn change_dsv_string_to_vec_of_string(parameters_dsv: String, delimiter:String) ->Vec<String> {
    match parameters_dsv.find(&delimiter) {
        Some(_index) => parameters_dsv
            .split(&delimiter)
            .map(|col| col.to_string())
            .collect(),
        None => {
            let mut rec: Vec<String> = Vec::new();
            rec.push(parameters_dsv);
            rec
        }
    }
}

pub fn convert_string_to_u128(string_value:&String) -> Result<u128,ContractBaseError> {
    match u128::from_str_radix(string_value.as_str(), 10) {
        Ok(value) => Ok(value),
        Err(_e) => return Err(ContractBaseError::ParameterInvalid),
    }
}

pub fn convert_string_to_u8(string_value:&String) -> Result<u8,ContractBaseError> {
    match u8::from_str_radix(string_value.as_str(), 10) {
        Ok(value) => Ok(value),
        Err(_e) => return Err(ContractBaseError::ParameterInvalid),
    }
}

pub fn convert_string_to_u16(string_value:&String) -> Result<u16,ContractBaseError> {
    match u16::from_str_radix(string_value.as_str(), 10) {
        Ok(value) => Ok(value),
        Err(_e) => return Err(ContractBaseError::ParameterInvalid),
    }
}

pub fn convert_string_to_u64(string_value:&String) -> Result<u64,ContractBaseError> {
    match u64::from_str_radix(string_value.as_str(), 10) {
        Ok(value) => Ok(value),
        Err(_e) => return Err(ContractBaseError::ParameterInvalid),
    }
}
