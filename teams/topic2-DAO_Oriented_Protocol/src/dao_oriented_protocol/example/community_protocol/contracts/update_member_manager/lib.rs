#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod update_member_manager {
    use default_contract::DefaultContractRef;
    use contract_helper::common::common_logics::{self, ContractBaseError};
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::*;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use openbrush::storage::Mapping;
    use scale::{Decode, Encode};

    #[ink(storage)]
    #[derive(Default)]
    pub struct UpdateMemberManager {
        member_list_with_id: Mapping<u128, MemberInfo>,
        member_list_with_eoa: Mapping<AccountId, MemberInfo>,
        next_member_id: u128,
        application_core_address: Option<AccountId>,
        command_list: Vec<String>,
        is_enable: bool,
        proposal_manager_address: Option<AccountId>,
        election_commisioner_list: Mapping<u128, AccountId>,
        next_commisioner_id: u128,
        community_protocol_address: Option<AccountId>,
    }

    impl ContractBase for UpdateMemberManager {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            match target_function.as_str() {
                "get_member_list" => {
                    let list: Vec<MemberInfo> = self.get_member_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                }
                "get_election_commisioner_list" => {
                    let list: Vec<MemberInfo> = self.get_election_commisioner_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                }
                _ => (),
            }
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

        fn _get_command_list(&self) -> &Vec<String> {
            &self.command_list
        }

        fn _function_calling_switch(
            &mut self,
            command: String,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            match command.as_str() {
                "add_member" => self._add_member(vec_of_parameters, caller_eoa),
                "delete_member" => self._delete_member(vec_of_parameters, caller_eoa),
                "delete_member_from_commucation_protocol" => self._delete_member_from_commucation_protocol(vec_of_parameters),
                "set_application_core_address" => self._set_application_core_address(vec_of_parameters),
                "change_election_commisioner" => self._change_election_commisioner(
                    vec_of_parameters,
                    caller_eoa
                ),
                "update_proposal_manager_address" => self._update_proposal_manager_address(
                    vec_of_parameters,
                    caller_eoa
                ),
                "set_proposal_manager_address" => self._set_proposal_manager_address(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }
    }

    impl UpdateMemberManager {
        #[ink(constructor)]
        pub fn new(first_member_name:String, community_protocol_address:AccountId) -> Self {
            let mut instance = Self::default();
            instance.command_list.push("add_member".to_string());
            instance.command_list.push("delete_member".to_string());
            // instance.command_list.push("change_enable_or_not".to_string());
            instance.command_list.push("set_application_core_address".to_string());
            instance
                .command_list
                .push("change_election_commisioner".to_string());
            instance
                .command_list
                .push("update_proposal_manager_address".to_string());
            instance.command_list.push("set_proposal_manager_address".to_string());
            instance.command_list.push("set_election_manager_address".to_string());
            instance.command_list.push("delete_member_from_commucation_protocol".to_string());
            instance.community_protocol_address = Some(community_protocol_address);
            
            instance._add_first_member(first_member_name);

            instance
        }

        // #[ink(constructor)]
        // pub fn new(pre_install_member_manager_address:AccountId, communication_protocol_address:AccountId) -> Self {
        //     let mut instance = Self::default();
        //     instance.command_list.push("add_member".to_string());
        //     instance.command_list.push("delete_member".to_string());
        //     // instance.command_list.push("change_enable_or_not".to_string());
        //     instance.command_list.push("set_application_core_address".to_string());
        //     instance
        //         .command_list
        //         .push("change_election_commisioner".to_string());
        //     instance
        //         .command_list
        //         .push("update_proposal_manager_address".to_string());
        //     instance.command_list.push("set_proposal_manager_address".to_string());
        //     instance.command_list.push("set_election_manager_address".to_string());
        //     instance.command_list.push("delete_member_from_commucation_protocol".to_string());
        //     instance.communication_protocol_address = Some(communication_protocol_address);
            
        //     instance._migrate_member_data(pre_install_member_manager_address);

        //     instance
        // }

        // /// I'm assuming you'll update it before you start using it this time.
        // fn _migrate_member_data(&mut self,pre_install_member_manager_address: AccountId) -> core::result::Result<(), ContractBaseError>{
        //     let instance: DefaultContractRef =
        //         ink::env::call::FromAccountId::from_account_id(pre_install_member_manager_address);
        //     let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_member_list".to_string());

        //     if get_value.len() > 1 {
        //         return Err(ContractBaseError::Custom("UnexpectedMigrationData".to_string()));
        //     }
        //     for value in get_value.iter() {
        //         let array_value: &[u8] = value.as_slice().try_into().unwrap();
        //         match MemberInfo::decode(&mut array_value.clone()) {
        //             Ok(value) => {
        //                 self._add_first_member(value.name);
        //                 return Ok(());
        //             },
        //             Err(_) => (),
        //         };
        //     }
        //     return Err(ContractBaseError::Custom("UnexpectedMigrationError".to_string()));
        // }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self,target_function:String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(&mut self, command:String, parameters_csv:String, caller_eoa: AccountId) -> core::result::Result<(), ContractBaseError>{
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        #[ink(message)]
        pub fn get_member_list(&self) -> Vec<MemberInfo> {
            ink::env::debug_println!("########## default_member::get_member_list:[1] ");
            let mut result: Vec<MemberInfo> = Vec::new();
            for i in 0..self.next_member_id {
                match self.member_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        #[ink(message)]
        pub fn get_election_commisioner_list(&self) -> Vec<MemberInfo> {
            let mut result: Vec<MemberInfo> = Vec::new();
            for i in 0..self.next_commisioner_id {
                match self.election_commisioner_list.get(&i) {
                    Some(address) => match self.member_list_with_eoa.get(&address) {
                        Some(member_info) => result.push(member_info),
                        None => (),
                    },
                    None => (),
                }
            }
            result
        }

        #[ink(message)]
        pub fn get_proposal_manager_address(&self) -> Option<AccountId> {
            self.proposal_manager_address
        }

        fn _update_proposal_manager_address(
            &mut self,
            vec_of_parameters: Vec<String>,
            _caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.proposal_manager_address = Some(address);
            Ok(())
        }

        fn _set_proposal_manager_address(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            ink::env::debug_println!("########## default_manager:_set_proposal_manager_address [1] ");
            if self._modifier_only_call_from_application_core(self.env().caller()) == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## default_manager:_set_proposal_manager_address [2] ");
            match self.proposal_manager_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => {
                    if vec_of_parameters.len() != 1 {
                        return Err(ContractBaseError::ParameterInvalid);
                    }
                    ink::env::debug_println!("########## default_manager:_set_proposal_manager_address [3] ");
                    let address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()){
                        Some(value) => value,
                        None => return Err(ContractBaseError::ParameterInvalid),
                    };
                    ink::env::debug_println!("########## default_manager:_set_proposal_manager_address [4] ");
                    self.proposal_manager_address = Some(address);
                },
            }
            Ok(())
        }

        /// change election commisioner
        /// params: list of account id
        fn _change_election_commisioner(
            &mut self,
            vec_of_parameters: Vec<String>,
            _caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if vec_of_parameters.len() < 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let mut address_list: Vec<AccountId> = Vec::new();
            for address_string in vec_of_parameters.iter() {
                match common_logics::convert_string_to_accountid(address_string) {
                    Some(value) => address_list.push(value),
                    None => return Err(ContractBaseError::ParameterInvalid),
                };
            }
            for i in 0..self.next_commisioner_id {
                self.election_commisioner_list.remove(&i);
            }
            self.next_commisioner_id = 0;
            for address in address_list.iter() {
                self.election_commisioner_list
                    .insert(&self.next_commisioner_id, address);
                self.next_commisioner_id += 1;
            }

            Ok(())
        }

        fn _add_first_member(&mut self, owner_name: String) {
            let caller = self.env().caller();
            let member_info: MemberInfo = MemberInfo {
                id: self.next_member_id,
                name: owner_name,
                address: caller,
            };
            self.member_list_with_id
                .insert(&self.next_member_id, &member_info);
            self.member_list_with_eoa.insert(&caller, &member_info);
            self.next_member_id += 1;

            self.election_commisioner_list
                .insert(&self.next_commisioner_id, &caller);
            self.next_commisioner_id += 1;
        }

        fn _add_member(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## default_member:_add_member [1]:vec_of_parameters:{:?} ",
                vec_of_parameters
            );
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## default_member:_add_member [2]");
            if self._modifier_only_call_from_member_eoa(caller_eoa) == false {
                return Err(ContractBaseError::Custom("Only Member does.".to_string()));
            }
            ink::env::debug_println!("########## default_member:_add_member [3]");
            match self.application_core_address {
                Some(_value) => self._add_member_impl(vec_of_parameters),
                None => return Err(ContractBaseError::TheAddressNotFound),
            }
        }

        /// Parameter csv data must have two values.
        /// <Member Name> , <Member Address>
        fn _add_member_impl(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_member:_add_member_impl [1]: vec_of_parameters:{:?}", vec_of_parameters);
            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::Custom("Invalid Proposal.".to_string()));
            }
            ink::env::debug_println!("########## default_member:_add_member_impl [3]");
            let member_address = match common_logics::convert_string_to_accountid(&vec_of_parameters[1]) {
                Some(value) => value,
                None => return Err(ContractBaseError::Custom("Invalid Proposal.".to_string())),
            };
            let member_info: MemberInfo = MemberInfo {
                id: self.next_member_id,
                name: vec_of_parameters[0].clone(),
                address: member_address,
            };
            self.member_list_with_id
                .insert(&self.next_member_id, &member_info);
            self.member_list_with_eoa
                .insert(&member_address, &member_info);
            self.next_member_id += 1;
            ink::env::debug_println!("########## default_member:_add_member_impl [4]");
            Ok(())
        }

        fn _valid_proposal_info_for_add(&self, proposal_info: &ProposalInfo) -> bool {
            match proposal_info.status {
                ProposalStatus::Executed => (),
                _ => return false,
            }
            match proposal_info.target_function.as_str() {
                "add_member" => true,
                _ => false,
            }
        }

        fn _valid_proposal_info_for_change_enabel_or_not(
            &self,
            proposal_info: &ProposalInfo,
        ) -> bool {
            match proposal_info.status {
                ProposalStatus::Executed => (),
                _ => return false,
            }
            match proposal_info.target_function.as_str() {
                "change_enable_or_not" => true,
                _ => false,
            }
        }

        fn _get_proposal_info(
            &self,
            proposal_id: u128,
        ) -> core::result::Result<ProposalInfo, ContractBaseError> {
            // let com_address = match self.communication_base_ref {
            //     Some(value) => value,
            //     None => return Err(ContractBaseError::CommunicationBaseContractAddressIsNotSet),
            // };
            match self.proposal_manager_address {
                Some(proposal_address) => {
                    // let instance: CommunicationBaseRef =
                    // //     ink::env::call::FromAccountId::from_account_id(com_address);
                    // let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
                    //     proposal_address,
                    //     "get_proposal_info_list".to_string(),
                    // );
                    let instance: DefaultContractRef =
                    ink::env::call::FromAccountId::from_account_id(proposal_address);
                    let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_proposal_info_list".to_string());
    
                    for value in get_value.iter() {
                        let array_value: &[u8] = value.as_slice().try_into().unwrap();
                        match ProposalInfo::decode(&mut array_value.clone()) {
                            Ok(value) => {
                                if value.id == proposal_id {
                                    return Ok(value);
                                }
                            }
                            Err(_) => {
                                return Err(ContractBaseError::Custom(
                                    "Getting proposal info is failure.".to_string(),
                                ))
                            }
                        };
                    }
                    Err(ContractBaseError::Custom(
                        "No matching proposals found.".to_string(),
                    ))
                }
                None => {
                    return Err(ContractBaseError::Custom(
                        "proposals manager never set.".to_string(),
                    ))
                }
            }
        }

        fn _delete_member(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_proposal() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            if self._modifier_only_call_from_member_eoa(caller_eoa) == false {
                return Err(ContractBaseError::Custom("Only Member does.".to_string()));
            }

            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let target_address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            let member_info = match self.member_list_with_eoa.get(&target_address) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.member_list_with_id.remove(&member_info.id);
            self.member_list_with_eoa.remove(&target_address);
            Ok(())
        }

        fn _delete_member_from_commucation_protocol(            
            &mut self,
            vec_of_parameters: Vec<String>
            // caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            if self._modifier_only_call_from_communication_protocol() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            // if self._modifier_only_call_from_member_eoa(caller_eoa) == false {
            //     return Err(ContractBaseError::Custom("Only Member does.".to_string()));
            // }

            if vec_of_parameters.len() != 1{
                return Err(ContractBaseError::ParameterInvalid);
            }
            let target_address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            let member_info = match self.member_list_with_eoa.get(&target_address) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.member_list_with_id.remove(&member_info.id);
            self.member_list_with_eoa.remove(&target_address);
            Ok(())
        }

        fn _modifier_only_call_from_communication_protocol(&self) -> bool {
            self.community_protocol_address == Some(self.env().caller())
        }

        fn _modifier_only_call_from_member_eoa(&self, caller_eoa: AccountId) -> bool {
            match self.member_list_with_eoa.get(&caller_eoa) {
                Some(_value) => true,
                None => false,
            }
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self.proposal_manager_address == Some(self.env().caller())
        }
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
            let update_member_manager = UpdateMemberManager::default();
            assert_eq!(update_member_manager.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut update_member_manager = UpdateMemberManager::new(false);
            assert_eq!(update_member_manager.get(), false);
            update_member_manager.flip();
            assert_eq!(update_member_manager.get(), true);
        }
    }
}
