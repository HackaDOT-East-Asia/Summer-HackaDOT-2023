#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_proposal {
    // use communication_base::communication_base::CommunicationBaseRef;
    // use application_core::ApplicationCoreRef;
    use default_contract::DefaultContractRef;

    use contract_helper::common::common_logics::{self, ContractBaseError};
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::{ElectionInfo, MemberInfo, ProposalStatus, *};
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    // use ink::storage::traits::StorageLayout;
    // use core::str::FromStr;
    use openbrush::storage::Mapping;
    use scale::{Decode, Encode};

    enum CheckChangingStatus {
        Valid,
        InvalidCaller,
        InvalidChangingStatus,
    }

    #[ink(storage)]
    //    #[derive(SpreadAllocate, Storage, Default)]
    pub struct DefaultProposal {
        proposal_list_with_id: Mapping<u128, ProposalInfo>,
        next_proposal_id: u128,
        application_core_address: Option<AccountId>,
        election_address: Option<AccountId>,
        command_list: Vec<String>,
        member_manager_address: Option<AccountId>,
        // communication_base_ref: AccountId,
        is_enable: bool,
    }

    impl ContractBase for DefaultProposal {
        /// get dao address
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            match target_function.as_str() {
                "get_proposal_info_list" => {
                    let list: Vec<ProposalInfo> = self.get_proposal_info_list();
                    for value in list.iter() {
                        result.push(value.encode());
                    }
                }
                _ => (),
            }
            result
        }

        /// [private] function set dao address
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
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_propsal:_function_calling_switch [1]");
            match command.as_str() {
                "add_proposal" => self._add_proposal(vec_of_parameters, caller_eoa),
                "change_proposal_status" => self._change_proposal_status(vec_of_parameters, caller_eoa),
                // "change_enable_or_not" => self._change_enable_or_not(vec_of_parameters),
                "execute_proposal" => self._execute_proposal(vec_of_parameters, caller_eoa),
                "set_application_core_address" => self._set_application_core_address(vec_of_parameters),
                "change_proposal_status_from_election" => self._change_proposal_status_from_election(vec_of_parameters, caller_eoa),
                "set_member_manager_address" => self._set_member_manager_address(vec_of_parameters),
                "set_election_manager_address" => self._set_election_manager_address(vec_of_parameters),
                // "update_member_manager" => self._update_member_manager(vec_of_parameters),
                // "update_election" => self._update_election(vec_of_parameters),
                _ => Err(ContractBaseError::CommnadNotFound),
            }
        }

        // /// [private] change status whether this contract can use
        // fn _change_enable_or_not(
        //     &mut self,
        //     vec_of_parameters: Vec<String>,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     match self.dao_address {
        //         Some(value) => {
        //             if !self._modifier_only_call_from_application_core(value) {
        //                 return Err(ContractBaseError::InvalidCallingFromOrigin);
        //             }
        //         }
        //         None => return Err(ContractBaseError::TheAddressNotFound),
        //     };
        //     match vec_of_parameters.len() == 1 {
        //         true => match bool::from_str(&vec_of_parameters[0]) {
        //             Ok(value) => {
        //                 self.is_enable = value;
        //                 Ok(())
        //             }
        //             Err(_) => return Err(ContractBaseError::ParameterInvalid),
        //         },
        //         false => return Err(ContractBaseError::ParameterInvalid),
        //     }
        // }
    }

    impl DefaultProposal {
        /// constructor
        #[ink(constructor)]
        // pub fn new(communication_base_ref: AccountId) -> Self {
        pub fn new() -> Self {
            Self {
                proposal_list_with_id: Mapping::default(),
                next_proposal_id: 0,
                application_core_address: None,
                election_address: None,
                command_list: [
                    "add_proposal".to_string(),
                    "change_proposal_status".to_string(),
                    "change_enable_or_not".to_string(),
                    "execute_proposal".to_string(),
                    "set_application_core_address".to_string(),
                    "update_member_manager".to_string(),
                    "update_election".to_string(),
                    "change_proposal_status_from_election".to_string(),
                    "set_member_manager_address".to_string(),
                    "set_election_manager_address".to_string()
                ]
                .to_vec(),
                member_manager_address: None,
                // communication_base_ref: communication_base_ref,
                is_enable: false,
            }
        }

        #[ink(message)]
        pub fn extarnal_get_data_interface(&self, target_function: String) -> Vec<Vec<u8>> {
            self.get_data(target_function)
        }

        #[ink(message)]
        pub fn extarnal_execute_interface(
            &mut self,
            command: String,
            parameters_csv: String,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            self._execute_interface(command, parameters_csv, caller_eoa)
        }

        fn _set_member_manager_address(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_application_core(self.env().caller()) == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            match self.member_manager_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => {
                    if vec_of_parameters.len() != 1 {
                        return Err(ContractBaseError::ParameterInvalid);
                    }
                    let address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()){
                        Some(value) => value,
                        None => return Err(ContractBaseError::ParameterInvalid),
                    };
                    self.member_manager_address = Some(address);
                },
            }
            Ok(())
        }

        fn _set_election_manager_address(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_application_core(self.env().caller()) == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            match self.election_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => {
                    if vec_of_parameters.len() != 1 {
                        return Err(ContractBaseError::ParameterInvalid);
                    }
                    let address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()){
                        Some(value) => value,
                        None => return Err(ContractBaseError::ParameterInvalid),
                    };
                    self.election_address = Some(address);
                },
            }
            Ok(())
        }

        // /// set member manager address
        // #[ink(message)]
        // pub fn set_member_manager_address(
        //     &mut self,
        //     member_manager_address: AccountId,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     match self.member_manager_address {
        //         Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
        //         None => self.member_manager_address = Some(member_manager_address),
        //     }
        //     Ok(())
        // }

        // /// set election address
        // #[ink(message)]
        // pub fn set_election_address(
        //     &mut self,
        //     election_address: AccountId,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     match self.election_address {
        //         Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
        //         None => self.election_address = Some(election_address),
        //     }
        //     Ok(())
        // }

        /// update member manager
        pub fn _update_member_manager(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.member_manager_address = Some(address);
            Ok(())
        }

        /// update election
        pub fn _update_election(
            &mut self,
            vec_of_parameters: Vec<String>,
        ) -> core::result::Result<(), ContractBaseError> {
            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let address = match common_logics::convert_string_to_accountid(&vec_of_parameters[0]) {
                Some(value) => value,
                None => return Err(ContractBaseError::ParameterInvalid),
            };
            self.election_address = Some(address);
            Ok(())
        }

        /// get proposal list
        #[ink(message)]
        pub fn get_proposal_info_list(&self) -> Vec<ProposalInfo> {
            let mut result: Vec<ProposalInfo> = Vec::new();
            for i in 0..self.next_proposal_id {
                match self.proposal_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        /// execute proposal
        fn _execute_proposal(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_proposal:_execute_proposal [1] ");
            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## default_proposal:_execute_proposal [2] ");
            match vec_of_parameters.len() {
                1 => {
                    ink::env::debug_println!("########## default_proposal:_execute_proposal [3] ");

                    let proposal_id =
                        match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                            Ok(value) => value,
                            Err(error) => return Err(error),
                        };
                    ink::env::debug_println!("########## default_proposal:_execute_proposal [4] ");

                    let mut proposal_info: ProposalInfo =
                        match self.proposal_list_with_id.get(&proposal_id) {
                            Some(value) => value,
                            None => return Err(ContractBaseError::ParameterInvalid),
                        };
                    ink::env::debug_println!("########## default_proposal:_execute_proposal [5] ");

                    if proposal_info.status != ProposalStatus::Executed {
                        return Err(ContractBaseError::Custom(
                            "TheProposalIsNotPassed".to_string(),
                        ));
                    }
                    let parameter = common_logics::change_dsv_string_to_vec_of_string(
                        proposal_info.parameters.clone(),
                        "$1$".to_string(),
                    );
                    ink::env::debug_println!(
                        "########## default_proposal:_execute_proposal [6]:parameter:{:?} ",
                        parameter
                    );
                    match proposal_info.target_contract == self.env().account_id() {
                        true => match proposal_info.target_function.as_str() {
                            "update_member_manager" => {
                                return self._update_member_manager(parameter)
                            }
                            "update_election" => return self._update_election(parameter),
                            _ => {
                                return Err(ContractBaseError::Custom(
                                    "TheProposalIsInvalid".to_string(),
                                ))
                            }
                        },
                        false => {
                            // let application_core_address = match self.get_application_core_address() {
                            //     Some(value) => value,
                            //     None => return Err(ContractBaseError::Custom("This is bug".to_string())),
                            // };
                            ink::env::debug_println!(
                                "########## default_proposal:_execute_proposal [7] "
                            );
                            ink::env::debug_println!(
                                "########## default_proposal:_execute_proposal [10] "
                            );
                            let mut instance: DefaultContractRef =
                                ink::env::call::FromAccountId::from_account_id(
                                    proposal_info.target_contract.clone(),
                                );
                            match instance.extarnal_execute_interface(
                                proposal_info.target_function.clone(),
                                proposal_info.parameters.clone(),
                                caller_eoa,
                            ) {
                                Ok(()) => {
                                    ink::env::debug_println!(
                                        "########## default_proposal:_execute_proposal [11] "
                                    );
                                    proposal_info.status = ProposalStatus::Finished;
                                    self.proposal_list_with_id
                                        .insert(&proposal_info.id, &proposal_info);
                                    return Ok(());
                                }
                                Err(error) => return Err(error),
                            }
                            // ink::env::debug_println!("####### default_proposal:_execute_proposal: proposal_info.target_contract:{:?}",proposal_info.target_contract);
                            // ink::env::debug_println!("####### default_proposal:_execute_proposal: applicaiton_core_address:{:?}",application_core_address);
                            // let mut instance: CommunicationBaseRef =
                            //     ink::env::call::FromAccountId::from_account_id(
                            //         self.communication_base_ref,
                            //     );
                            //     match proposal_info.target_contract == application_core_address
                            //     {
                            //         true => {
                            //             ink::env::debug_println!("########## default_proposal:_execute_proposal [8] ");
                            //             let mut app_core_ref: ApplicationCoreRef =
                            //                 ink::env::call::FromAccountId::from_account_id(application_core_address);
                            //             match app_core_ref.call_point_from_proposal(
                            //                 proposal_info.target_function.clone(),
                            //                 proposal_info.parameters.clone()
                            //             ) {
                            //                 Ok(()) => {
                            //                     ink::env::debug_println!("########## default_proposal:_execute_proposal [9] ");
                            //                     proposal_info.status = ProposalStatus::Finished;
                            //                     self.proposal_list_with_id
                            //                         .insert(&proposal_info.id, &proposal_info);
                            //                     return Ok(());
                            //                 }
                            //                 Err(_) => return Err(ContractBaseError::Custom("ExecutingApplicationCoreIsFailure.".to_string())),
                            //             }
                            //         }
                            //         false => {
                            //             ink::env::debug_println!("########## default_proposal:_execute_proposal [10] ");
                            //             let mut instance: DefaultContractRef =
                            //                 ink::env::call::FromAccountId::from_account_id(
                            //                     proposal_info.target_contract.clone(),
                            //                 );
                            //             match instance.extarnal_execute_interface(
                            //                 proposal_info.target_function.clone(),
                            //                 proposal_info.parameters.clone(),
                            //                 caller_eoa,
                            //             ) {
                            //                 Ok(()) => {
                            //                     ink::env::debug_println!("########## default_proposal:_execute_proposal [11] ");
                            //                     proposal_info.status = ProposalStatus::Finished;
                            //                     self.proposal_list_with_id
                            //                         .insert(&proposal_info.id, &proposal_info);
                            //                     return Ok(());
                            //                 }
                            //                 Err(error) => return Err(error),
                            //             }
                            //         }
                            //     }
                        }
                    }
                }
                _ => return Err(ContractBaseError::ParameterInvalid),
            }
        }

        /// add proposal
        fn _add_proposal(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## default_propsal:_add_proposal::::::[1] ###############"
            );

            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!(
                "########## default_propsal:_add_proposal::::::[2] ###############"
            );
            if self._modifier_only_call_from_member_eoa(caller_eoa) == false {
                return Err(ContractBaseError::Custom("Only Member does.".to_string()));
            }
            ink::env::debug_println!(
                "########## default_propsal:_add_proposal::::::[3] : vec_of_parameters.len():{:?}",
                vec_of_parameters.len()
            );
            ink::env::debug_println!(
                "########## default_propsal:_add_proposal::::::[3] : vec_of_parameters:{:?}",
                vec_of_parameters
            );
            if vec_of_parameters.len() != 8 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            let replaced_string = vec_of_parameters[7].replace("$2$", "$1$");

            self._add_proposal_impl(
                &vec_of_parameters[0],
                &vec_of_parameters[1],
                &vec_of_parameters[2],
                &vec_of_parameters[3],
                &vec_of_parameters[4],
                &vec_of_parameters[5],
                &vec_of_parameters[6],
                &replaced_string,
                caller_eoa,
            )
        }

        /// add proposal impl
        /// Parameters: kind(Number),
        fn _add_proposal_impl(
            &mut self,
            kind: &String,
            title: &String,
            outline: &String,
            description: &String,
            github_url: &String,
            target_contract: &String,
            target_function: &String,
            parameters: &String,
            _caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## default_propsal:_add_proposal_impl::::::[1] ###############"
            );

            let contract_address = match common_logics::convert_string_to_accountid(target_contract)
            {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "Target contract is invalid.".to_string(),
                    ))
                }
            };
            ink::env::debug_println!(
                "########## default_propsal:_add_proposal_impl::::::[2] ###############"
            );
            let proposal_kind = match u8::from_str_radix(kind.as_str(), 10) {
                Ok(value) => self._change_to_kind_from_u8(value),
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };

            let proposal_info = ProposalInfo {
                kind: proposal_kind,
                id: self.next_proposal_id,
                title: title.to_string(),
                outline: outline.to_string(),
                github_url: github_url.to_string(),
                description: description.to_string(),
                target_contract: contract_address,
                target_function: target_function.to_string(),
                parameters: parameters.to_string(),
                status: ProposalStatus::Proposed,
            };
            self.proposal_list_with_id
                .insert(&proposal_info.id, &proposal_info);
            self.next_proposal_id += 1;

            ink::env::debug_println!(
                "########## default_propsal:_add_proposal_impl::::::[3] ###############"
            );
            // match self._create_or_end_election(
            //     self.next_proposal_id,
            //     ProposalStatus::Proposed,
            //     caller_eoa,
            // ) {
            //     Ok(()) => {
            //         self.next_proposal_id += 1;
            //     }
            //     Err(error) => return Err(error),
            // }
            // ink::env::debug_println!(
            //     "########## default_propsal:_add_proposal_impl::::::[4] ###############"
            // );
            Ok(())
        }

        fn _change_proposal_status(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_proposal:_change_proposal_status [1] ");

            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## default_proposal:_change_proposal_status [2] ");

            if self._modifier_only_call_from_election_commisioner(caller_eoa) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }

            // if self._modifier_only_call_from_election() == false {
            //     return Err(ContractBaseError::InvalidCallingFromOrigin);
            // };
            ink::env::debug_println!("########## default_proposal:_change_proposal_status [3] ");
            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            };
            ink::env::debug_println!("########## default_proposal:_change_proposal_status [4] ");

            let target_proposal_id = match u128::from_str_radix(vec_of_parameters[0].as_str(), 10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            ink::env::debug_println!("########## default_proposal:_change_proposal_status [5] ");

            let to_status_u8 = match u8::from_str_radix(vec_of_parameters[1].as_str(), 10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            ink::env::debug_println!("########## default_proposal:_change_proposal_status [6] ");

            self._change_proposal_status_impl(
                target_proposal_id,
                self._change_to_status_from_u8(to_status_u8),
                caller_eoa,
            )
        }

        fn _change_proposal_status_from_election(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_from_election [1] "
            );
            if self._modifier_only_call_from_election() == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_from_election [2] "
            );
            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            };
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_from_election [3] "
            );

            let target_proposal_id = match u128::from_str_radix(vec_of_parameters[0].as_str(), 10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_from_election [4] "
            );

            let to_status_u8 = match u8::from_str_radix(vec_of_parameters[1].as_str(), 10) {
                Ok(value) => value,
                Err(_e) => return Err(ContractBaseError::ParameterInvalid),
            };
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_from_election [5] "
            );

            self._change_proposal_status_impl(
                target_proposal_id,
                self._change_to_status_from_u8(to_status_u8),
                caller_eoa,
            )
        }

        fn _change_proposal_status_impl(
            &mut self,
            target_proposal_id: u128,
            to_status: ProposalStatus,
            caller_eoa: AccountId,
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_impl [1] "
            );

            let mut proposal_info = match self.proposal_list_with_id.get(&target_proposal_id) {
                Some(value) => value,
                None => return Err(ContractBaseError::TragetDataNotFound),
            };
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_impl [2] "
            );

            match self._check_changing_status_valid(
                target_proposal_id,
                &proposal_info.status,
                &to_status,
                caller_eoa,
            ) {
                CheckChangingStatus::Valid => (),
                _ => {
                    ink::env::debug_println!(
                        "########## default_proposal:_change_proposal_status_impl [3] "
                    );
                    return Err(ContractBaseError::Custom(
                        "Changing Status Is Invalid".to_string(),
                    ));
                }
            };
            proposal_info.status = to_status.clone();
            self.proposal_list_with_id
                .insert(&proposal_info.id, &proposal_info);
            ink::env::debug_println!(
                "########## default_proposal:_change_proposal_status_impl [4] "
            );
            Ok(())
            // self._create_or_end_election(proposal_info.id, to_status, caller_eoa)
        }

        fn _check_changing_status_valid(
            &self,
            _proposal_id: u128,
            from_status: &ProposalStatus,
            to_status: &ProposalStatus,
            caller_eoa: AccountId,
        ) -> CheckChangingStatus {
            ink::env::debug_println!(
                "########## default_proposal:_check_changing_status_valid [1] "
            );

            match from_status {
                ProposalStatus::None => match to_status {
                    ProposalStatus::Proposed => {
                        if self._modifier_only_call_from_member_eoa(caller_eoa) == false {
                            ink::env::debug_println!(
                                "########## default_proposal:_check_changing_status_valid [2] "
                            );
                            return CheckChangingStatus::InvalidCaller;
                        } else {
                            ink::env::debug_println!(
                                "########## default_proposal:_check_changing_status_valid [3] "
                            );
                            return CheckChangingStatus::Valid;
                        }
                    }
                    _ => {
                        ink::env::debug_println!(
                            "########## default_proposal:_check_changing_status_valid [4] "
                        );
                        return CheckChangingStatus::InvalidChangingStatus;
                    }
                },
                ProposalStatus::Proposed => match to_status {
                    // ProposalStatus::Voting | ProposalStatus::Denied => {
                    ProposalStatus::Voting => {
                        if self._modifier_only_call_from_election() == false {
                            ink::env::debug_println!(
                                "########## default_proposal:_check_changing_status_valid [5] "
                            );
                            return CheckChangingStatus::InvalidCaller;
                        }
                        // match self._get_election_info(proposal_id) {
                        //     Ok(_) => (),
                        //     Err(_) => {
                        //         ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [5] ");
                        //         return CheckChangingStatus::InvalidChangingStatus;
                        //     },
                        // }
                        if self._modifier_only_call_from_election_commisioner(caller_eoa) == false {
                            ink::env::debug_println!(
                                "########## default_proposal:_check_changing_status_valid [6] "
                            );
                            return CheckChangingStatus::InvalidCaller;
                        } else {
                            ink::env::debug_println!(
                                "########## default_proposal:_check_changing_status_valid [7] "
                            );
                            return CheckChangingStatus::Valid;
                        }
                    }
                    _ => {
                        ink::env::debug_println!(
                            "########## default_proposal:_check_changing_status_valid [8] "
                        );
                        return CheckChangingStatus::InvalidChangingStatus;
                    }
                },
                ProposalStatus::Voting => match to_status {
                    ProposalStatus::Executed | ProposalStatus::Denied => CheckChangingStatus::Valid,
                    _ => {
                        ink::env::debug_println!(
                            "########## default_proposal:_check_changing_status_valid [14] "
                        );
                        return CheckChangingStatus::InvalidChangingStatus;
                    }
                },
                //     ProposalStatus::FinishVoting => {
                //         match self._get_election_info(proposal_id) {
                //             Ok(value) => match value.is_passed {
                //                 Some(_) => (),
                //                 None => {
                //                     ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [9] ");
                //                     return CheckChangingStatus::InvalidChangingStatus;
                //                 },
                //             },
                //             Err(_) => {
                //                 ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [10] ");
                //                 return CheckChangingStatus::InvalidChangingStatus;
                //             },
                //         }
                //         if self._modifier_only_call_from_election_commisioner(caller_eoa) == false {
                //             ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [11] ");
                //             return CheckChangingStatus::InvalidCaller;
                //         } else {
                //             ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [12] ");
                //             return CheckChangingStatus::Valid;
                //         }
                //     }
                //     _ => {
                //         ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [13] ");
                //         return CheckChangingStatus::InvalidChangingStatus;
                //     },
                // },
                // ProposalStatus::FinishVoting => match to_status {
                //     ProposalStatus::Executed | ProposalStatus::Denied => CheckChangingStatus::Valid,
                //     _ => {
                //         ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [14] ");
                //         return CheckChangingStatus::InvalidChangingStatus
                //     },
                // },
                ProposalStatus::Executed => match to_status {
                    ProposalStatus::Finished => {
                        match self._modifier_only_call_from_election() {
                            true => {
                                ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [15] ");
                                return CheckChangingStatus::Valid;
                            }
                            false => {
                                ink::env::debug_println!("########## default_proposal:_check_changing_status_valid [16] ");
                                return CheckChangingStatus::InvalidCaller;
                            }
                        }
                    }
                    _ => {
                        ink::env::debug_println!(
                            "########## default_proposal:_check_changing_status_valid [17] "
                        );
                        return CheckChangingStatus::InvalidChangingStatus;
                    }
                },
                _ => {
                    ink::env::debug_println!(
                        "########## default_proposal:_check_changing_status_valid [18] "
                    );
                    return CheckChangingStatus::InvalidChangingStatus;
                }
            }
        }

        fn _change_to_status_from_u8(&self, value: u8) -> ProposalStatus {
            match value {
                1 => ProposalStatus::Proposed,
                2 => ProposalStatus::Voting,
                3 => ProposalStatus::FinishVoting,
                4 => ProposalStatus::Executed,
                5 => ProposalStatus::Denied,
                6 => ProposalStatus::Finished,
                _ => ProposalStatus::None,
            }
        }

        fn _change_to_kind_from_u8(&self, value: u8) -> ProposalKind {
            match value {
                1 => ProposalKind::ResetElectionCommisioner,
                2 => ProposalKind::Other,
                _ => ProposalKind::None,
            }
        }

        /// create vote or election
        // fn _create_or_end_election(
        //     &self,
        //     proposal_id: u128,
        //     to_status: ProposalStatus,
        //     caller_eoa: AccountId,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     let election_address = match self.election_address {
        //         Some(value) => value,
        //         None => return Err(ContractBaseError::TheAddressNotFound),
        //     };
        //     let mut instance: CommunicationBaseRef =
        //         ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
        //     match to_status {
        //         ProposalStatus::Proposed => {
        //             return instance.call_execute_interface_of_function(
        //                 election_address,
        //                 "create_election".to_string(),
        //                 proposal_id.to_string(),
        //                 caller_eoa,
        //             );
        //         }
        //         ProposalStatus::FinishVoting => {
        //             let member_count = match self._get_member_info_list() {
        //                 Ok(member_list) => member_list.len(),
        //                 Err(error) => return Err(error),
        //             };
        //             let parameter = proposal_id.to_string() + "," + &member_count.to_string();

        //             return instance.call_execute_interface_of_function(
        //                 election_address,
        //                 "end_election".to_string(),
        //                 parameter,
        //                 caller_eoa,
        //             );
        //         }
        //         _ => (),
        //     }
        //     Ok(())
        // }

        // fn _modifier_only_call_from_election(&self) -> bool {
        //     match self.election_address {
        //         Some(value) => value == self.env().caller(),
        //         None => false,
        //     }
        // }

        fn _modifier_only_call_from_election_commisioner(&self, caller: AccountId) -> bool {
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => return false,
            };
            ink::env::debug_println!("########## default_proposal:_modifier_only_call_from_election_commisioner [1]:caller:{:?}",caller);

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> =
                instance.extarnal_get_data_interface("get_election_commisioner_list".to_string());

            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
            //     member_manager_address,
            //     "get_election_commisioner_list".to_string(),
            // );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        ink::env::debug_println!("########## default_proposal:_modifier_only_call_from_election_commisioner [2]:MemberInfo:{:?}",value);
                        if value.address == caller {
                            return true;
                        }
                    }
                    Err(_) => return false,
                };
            }
            false
        }

        fn _modifier_only_call_from_member_eoa(&self, caller_eoa: AccountId) -> bool {
            ink::env::debug_println!("########## default_proposal:_modifier_only_call_from_member_eoa caller_eoa is {:?}", caller_eoa);
            ink::env::debug_println!("########## default_proposal:_modifier_only_call_from_member_eoa _get_member_info_list is {:?}", self._get_member_info_list());
            match self._get_member_info_list() {
                Ok(member_list) => {
                    for member_info in member_list {
                        if member_info.address == caller_eoa {
                            return true;
                        };
                    }
                }
                Err(_) => return false,
            }
            false
        }

        fn _modifier_only_call_from_election(&self) -> bool {
            match self.election_address {
                Some(value) => value == self.env().caller(),
                None => false,
            }
        }

        fn _get_election_info(
            &self,
            proposal_id: u128,
        ) -> core::result::Result<ElectionInfo, ContractBaseError> {
            ink::env::debug_println!("########## default_proposal::_get_election_info_list:[1] ");
            let election_address = match self.election_address {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "ElectionAddressIsNotSet".to_string(),
                    ))
                }
            };
            ink::env::debug_println!("########## default_proposal::_get_election_info_list:[2] ");

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(election_address);
            let get_value: Vec<Vec<u8>> =
                instance.extarnal_get_data_interface("get_election_info_list".to_string());

            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // let get_value: Vec<Vec<u8>> = instance
            //     .get_data_from_contract(election_address, "get_election_info_list".to_string());

            ink::env::debug_println!(
                "########## default_proposal::_get_election_info_list:[3]:{:?}",
                get_value
            );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ElectionInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if value.proposal_id == proposal_id {
                            return Ok(value);
                        }
                    }
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "GotAnErrorGettingElectionInfo".to_string(),
                        ))
                    }
                };
            }
            ink::env::debug_println!("########## default_proposal::_get_election_info_list:[4] ");
            Err(ContractBaseError::Custom(
                "TargetElectionDoesNotFind.".to_string(),
            ))
        }

        fn _get_member_info_list(
            &self,
        ) -> core::result::Result<Vec<MemberInfo>, ContractBaseError> {
            ink::env::debug_println!("########## default_proposal::_get_member_info_list:[1] ");
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "MemberManagerAddressIsNotSet".to_string(),
                    ))
                }
            };
            ink::env::debug_println!("########## default_proposal::_get_member_info_list:[2] ");
            let mut result: Vec<MemberInfo> = Vec::new();

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> =
                instance.extarnal_get_data_interface("get_member_list".to_string());

            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // let get_value: Vec<Vec<u8>> = instance
            //     .get_data_from_contract(member_manager_address, "get_member_list".to_string());

            ink::env::debug_println!(
                "########## default_proposal::_get_member_info_list:[3]:{:?}",
                get_value
            );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "GotAnErrorGettingMemberInfo".to_string(),
                        ))
                    }
                };
            }
            ink::env::debug_println!("########## default_proposal::_get_member_info_list:[4] ");

            Ok(result)
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use contract_helper::common::common_logics;

        #[ink::test]
        fn set_application_core_address_works() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            // set_dao_address twice is error
            assert_eq!(
                default_proposal.set_dao_address(dao_address),
                Err(ContractBaseError::SetTheAddressOnlyOnece)
            );
        }

        // get dao_address
        #[ink::test]
        fn get_dao_address_works() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            assert_eq!(default_proposal.get_dao_address().unwrap(), dao_address);
        }

        // add proposal works
        #[ink::test]
        fn add_proposal_works() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            ink::env::test::set_caller::<Environment>(dao_address);
            let result = default_proposal.execute_interface(
                "add_proposal".to_string(),
                "title title,outline,https://github.com,This is description,add_member,address"
                    .to_string(),
            );
            assert_eq!(result, Ok(()));

            let list = default_proposal.get_proposal_info_list();
            assert_eq!(list.len(), 1);
        }

        // change status
        // #[ink::test]
        // fn change_status_works(){
        //     let election_address = common_logics::convert_string_to_accountid("ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR");
        //     let mut default_proposal = DefaultProposal::new(election_address);
        // }

        // command_not_found
        #[ink::test]
        fn command_not_found_is_error() {
            let election_address = common_logics::convert_string_to_accountid(
                "ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR",
            );
            let mut default_proposal = DefaultProposal::new();
            let dao_address = common_logics::convert_string_to_accountid(
                "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8",
            );
            assert_eq!(default_proposal.set_dao_address(dao_address), Ok(()));
            let mut default_proposal = DefaultProposal::new();
            assert_eq!(
                default_proposal.execute_interface(
                    "this_command_is_not_found".to_string(),
                    "ajYMsCKsEAhEvHpeA4XqsfiA9v1CdzZPrCfS6pEfeGHW9j8,aaaaaa".to_string(),
                ),
                Err(ContractBaseError::CommnadNotFound)
            );
        }
    }
}
