#![cfg_attr(not(feature = "std"), no_std)]
// #![feature(min_specialization)]

pub use crate::traits::errors::contract_error::ContractBaseError;
pub use crate::common::common_logics;
use ink::prelude::{
    string::{ String, ToString },
    vec::Vec,
};

use openbrush::traits::AccountId;

#[openbrush::wrapper]
pub type ContractBaseRef = dyn ContractBase;

#[openbrush::trait_definition]
pub trait ContractBase {

    fn _execute_interface(&mut self, command:String, parameters_csv:String, caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError>{
        let command_list = self._get_command_list();
        if command_list.iter().filter(|item| *item == &command).collect::<Vec<&String>>().len() == 0{
            return Err(ContractBaseError::CommnadNotFound);
        }
        self._execute_interface_impl(command, parameters_csv, caller_eoa)
    }

    fn _set_application_core_address(
        &mut self,
        vec_of_parameters:Vec<String>,
    ) -> core::result::Result<(), ContractBaseError> {
        match self.get_application_core_address() {
            Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
            None => {
                match vec_of_parameters.len(){
                    1 => {
                        match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()){
                            Some(value) => self._set_application_core_address_impl(value),
                            None => return Err(ContractBaseError::ParameterInvalid),
                        }
                    },
                    _ => return Err(ContractBaseError::ParameterInvalid), 
                }
            },
        }
    }

    fn _execute_interface_impl(&mut self, command:String, parameters_csv:String, caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError>{
        let vec_of_parameters: Vec<String> = match parameters_csv.find(&"$1$".to_string()) {
            Some(_index) => parameters_csv
                .split(&"$1$".to_string())
                .map(|col| col.to_string())
                .collect(),
            None => {
                let mut rec: Vec<String> = Vec::new();
                rec.push(parameters_csv);
                rec
            }
        };
        self._function_calling_switch(command, vec_of_parameters, caller_eoa)
    }

    fn _modifier_only_call_from_application_core(&self,caller:AccountId) -> bool {
        ink::env::debug_println!("########## contract_base:_modifier_only_call_from_application_core get_application_core_address:{:?}",self.get_application_core_address());
        ink::env::debug_println!("########## contract_base:_modifier_only_call_from_application_core caller:{:?}",caller);

        match self.get_application_core_address() {
            Some(value) => value == caller,
            None => false,
        }
    }

    #[ink(message)]
    fn get_application_core_address(&self) -> Option<AccountId>;
    
    #[ink(message)]
    fn get_data(&self,target_function:String) -> Vec<Vec<u8>>;

    // todo: 全ての関数インタフェースかつパラメータの説明付き文を取得出来る関数を実装する
    
    fn _set_application_core_address_impl(&mut self, application_core_address:AccountId) -> core::result::Result<(), ContractBaseError>;

    fn _get_command_list(&self) -> &Vec<String>; 

    fn _function_calling_switch(&mut self, command:String, vec_of_parameters:Vec<String>, caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError>;

    // fn _change_enable_or_not(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>;

}