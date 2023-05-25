#![cfg_attr(not(feature = "std"), no_std)]

// const EVM_ID: u8 = 0x0F;

#[openbrush::contract]
// #[ink::contract(env = xvm_environment::XvmDefaultEnvironment)]
mod dao_oriented_flipper {
    // use communication_base::communication_base::CommunicationBaseRef;
    use default_contract::DefaultContractRef;

    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::{ElectionInfo, *};
    use contract_helper::common::common_logics::{self, ContractBaseError};
    use core::str::FromStr;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use openbrush::storage::Mapping;
    use scale::{Decode, Encode};
    // use hex_literal::hex;

    // const FLIP_SELECTOR: [u8; 4] = hex!["cde4efa9"];

    #[ink(storage)]
    pub struct DaoOrientedFlipper {
        // evm_address: [u8; 20],
        application_core_address: Option<AccountId>,
        proposal_manager_address: AccountId,
        // communication_base_ref: AccountId,
        // member_manager_address: AccountId,
        command_list: Vec<String>,
        value: bool,
    }

    impl ContractBase for DaoOrientedFlipper {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            result
        }

        fn _set_application_core_address_impl(
            &mut self,
            application_core_address: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            match self.application_core_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => self.application_core_address = Some(application_core_address),
            }
            Ok(())
        }

        /// [private] get command list
        fn _get_command_list(&self) -> &Vec<String> {
            &self.command_list
        }

        /// [private] switch of call function
        fn _function_calling_switch(
            &mut self,
            command: String,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "dao_flip" => self._dao_flip(vec_of_parameters, caller_eoa),
                "set_application_core_address" => self._set_application_core_address(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

    }

    impl DaoOrientedFlipper {
        #[ink(constructor)]
        // pub fn new(evm_address: [u8; 20], communication_base_ref: AccountId ,member_manager_address: AccountId, proposal_manager_address:AccountId) -> Self {
        // pub fn new(init_value: bool, communication_base_ref: AccountId ,member_manager_address: AccountId, proposal_manager_address:AccountId) -> Self {
        pub fn new(init_value: bool,  proposal_manager_address:AccountId) -> Self {
            Self {
                // evm_address,
                // communication_base_ref,
                // member_manager_address,
                proposal_manager_address,
                command_list: [
                    "dao_flip".to_string(),
                    "set_application_core_address".to_string(),
                    ].to_vec(),
                application_core_address: None,
                value: init_value,
            }
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self,target_function:String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(&mut self, command:String, parameters_csv:String, caller_eoa: AccountId) -> core::result::Result<(), ContractBaseError>{
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        #[ink(message)]
        pub fn get(&self) -> bool {
            self.value
        }

        fn _dao_flip(&mut self, vec_of_parameters: Vec<String>, caller_eoa: AccountId) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            self.value = !self.value;
            return Ok(())
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self.proposal_manager_address == self.env().caller()
        }


        // #[ink(message)]
        // pub fn flip(&mut self) {
        //     let encoded_input = Self::flip_encode();
        //     self.env()
        //         .extension()
        //         .xvm_call(
        //             super::EVM_ID,
        //             Vec::from(self.evm_address.as_ref()),
        //             encoded_input,
        //         )
        //         .is_ok();
        // }

        // fn flip_encode() -> Vec<u8> {
        //     let mut encoded = FLIP_SELECTOR.to_vec();
        //     encoded
        // }

    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;

        /// We test if the default constructor does its job.
        #[ink::test]
        fn default_works() {
            let xvm_dao_oriented_flipper = XvmDaoOrientedFlipper::default();
            assert_eq!(xvm_dao_oriented_flipper.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut xvm_dao_oriented_flipper = XvmDaoOrientedFlipper::new(false);
            assert_eq!(xvm_dao_oriented_flipper.get(), false);
            xvm_dao_oriented_flipper.flip();
            assert_eq!(xvm_dao_oriented_flipper.get(), true);
        }
    }
}
