#![cfg_attr(not(feature = "std"), no_std)]

pub use self::default_contract::{DefaultContract, DefaultContractRef};

#[openbrush::contract]
pub mod default_contract {
    use contract_helper::traits::contract_base::contract_base::*;
    use ink::prelude::string::{String,ToString};
    use ink::prelude::vec::Vec;

    #[ink(storage)]
    pub struct DefaultContract {
        application_core_address: Option<AccountId>,
        command_list: Vec<String>,
        is_enable: bool,
    }

    impl ContractBase for DefaultContract {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        #[ink(message)]
        fn get_data(&self,_target_function:String) -> Vec<Vec<u8>> {
            let return_value:Vec<Vec<u8>> = Vec::new();
            return_value
        }
    
        fn _set_application_core_address_impl(
            &mut self,
            application_core_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            self.application_core_address = Some(application_core_address);
            Ok(())
        }

        fn _get_command_list(&self) -> &Vec<String> {
            &self.command_list
        }

        fn _function_calling_switch(
            &mut self,
            command: String,
            _vec_of_parameters: Vec<String>,
            _caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "test_function" => self._test_function(),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

        // fn _change_enable_or_not(&mut self, _vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
        //     self.is_enable = true;
        //     Ok(())
        // }
    }

    impl DefaultContract {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { 
                application_core_address: None,
                command_list: [
                    "test_function".to_string(),
                ].to_vec(),
                is_enable: false,            
            }
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self,target_function:String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(&mut self, command:String, parameters_csv:String,caller_eoa:AccountId) -> core::result::Result<(), ContractBaseError>{
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        fn _test_function(&self) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## source caller ############### value is {:?}", self.env().caller());
            Ok(())
        }

    }
}