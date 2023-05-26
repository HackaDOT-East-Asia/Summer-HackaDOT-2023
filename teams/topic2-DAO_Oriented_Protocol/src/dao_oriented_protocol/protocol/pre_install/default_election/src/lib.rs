#![cfg_attr(not(feature = "std"), no_std)]

#[openbrush::contract]
mod default_election {
    //use communication_base::communication_base::CommunicationBaseRef;
    use default_contract::DefaultContractRef;

    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::{ElectionInfo, *};
    use contract_helper::common::common_logics::{self, ContractBaseError};
    // use core::str::FromStr;
    use ink::prelude::string::{String, ToString};
    use ink::prelude::vec::Vec;
    use openbrush::storage::Mapping;
    use scale::{Decode, Encode};

    #[ink(storage)]
    pub struct DefaultElection {
        election_list_with_proposal_id: Mapping<u128, ElectionInfo>,
        election_list_with_election_id: Mapping<u128, ElectionInfo>,
        minimum_voter_turnout_percentage: u64,
        passing_percentage: u64,
        application_core_address: Option<AccountId>,
        remain_term_electoral_commissioner: u8,
        next_election_id: u128,
        command_list: Vec<String>,
        proposal_manager_address: Option<AccountId>,
        // communication_base_ref: AccountId,
        member_manager_address: Option<AccountId>,
    }

    impl ContractBase for DefaultElection {
        #[ink(message)]
        fn get_application_core_address(&self) -> Option<AccountId> {
            self.application_core_address
        }

        /// get data interface
        #[ink(message)]
        fn get_data(&self, target_function: String) -> Vec<Vec<u8>> {
            let mut result: Vec<Vec<u8>> = Vec::new();
            match target_function.as_str() {
                "get_election_info_list" => {
                    let list: Vec<ElectionInfo> = self.get_election_info_list();
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
            match command.as_str() {
                "create_election" => self._create_election(vec_of_parameters, caller_eoa),
                // "start_election" => self._start_election(vec_of_parameters),
                "vote" => self._vote(vec_of_parameters, caller_eoa),
                "end_election" => self._end_election(vec_of_parameters, caller_eoa),
                "reset_minimum_voter_turnout_percentage" => self
                    ._reset_minimum_voter_turnout_percentage(
                        vec_of_parameters,
                        caller_eoa
                    ),
                "reset_passing_percentage" => self._reset_passing_percentage(vec_of_parameters, caller_eoa),
                // "change_enable_or_not" => self._change_enable_or_not(vec_of_parameters),
                "set_application_core_address" => self._set_application_core_address(vec_of_parameters),
                "update_proposal_manager_address" => self._update_proposal_manager_address(
                    vec_of_parameters,
                    caller_eoa
                ),
                "update_member_manager_address" => self._update_member_manager(vec_of_parameters),
                "set_member_manager_address" => self._set_member_manager_address(vec_of_parameters),
                "set_proposal_manager_address" => self._set_proposal_manager_address(vec_of_parameters),
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
        //         true => {
        //             match bool::from_str(&vec_of_parameters[0]) {
        //                 Ok(value) => {
        //                     self.is_enable = value;
        //                     Ok(())
        //                 },
        //                 Err(_) => return Err(ContractBaseError::ParameterInvalid),
        //             }
        //         },
        //         false => return Err(ContractBaseError::ParameterInvalid),
        //     }
        // }
    }

    impl DefaultElection {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor)]
        // pub fn new(communication_base_ref: AccountId) -> Self {
        pub fn new() -> Self {
        Self {
                election_list_with_proposal_id: Mapping::default(),
                election_list_with_election_id: Mapping::default(),
                minimum_voter_turnout_percentage: 50,
                passing_percentage: 50,
                application_core_address: None,
                remain_term_electoral_commissioner: 5,
                next_election_id: 0,
                command_list: [
                    "create_election".to_string(),
                    // "start_election".to_string(),
                    "vote".to_string(),
                    "end_election".to_string(),
                    "reset_minimum_voter_turnout_percentage".to_string(),
                    "reset_passing_percentage".to_string(),
                    // "change_enable_or_not".to_string(),
                    "set_application_core_address".to_string(),
                    "update_proposal_manager_address".to_string(),
                    "update_member_manager_address".to_string(),
                    "set_member_manager_address".to_string(),
                    "set_proposal_manager_address".to_string(),
                ]
                .to_vec(),
                // communication_base_ref: communication_base_ref,
                member_manager_address: None,
                proposal_manager_address: None,
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

        // #[ink(message)]
        // pub fn set_proposal_manager_address(
        //     &mut self,
        //     proposal_manager_address: AccountId,
        // ) -> core::result::Result<(), ContractBaseError> {
        //     match self.proposal_manager_address {
        //         Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
        //         None => self.proposal_manager_address = Some(proposal_manager_address),
        //     }
        //     Ok(())
        // }

        #[ink(message)]
        pub fn get_election_info_list(&self) -> Vec<ElectionInfo> {
            let mut result: Vec<ElectionInfo> = Vec::new();
            for i in 0..self.next_election_id {
                let election_info = match self.election_list_with_election_id.get(&i) {
                    Some(value) => value,
                    None => continue,
                };
                result.push(election_info);
            }
            result
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

        fn _set_proposal_manager_address(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
            if self._modifier_only_call_from_application_core(self.env().caller()) == false{
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            match self.proposal_manager_address {
                Some(_value) => return Err(ContractBaseError::SetTheAddressOnlyOnece),
                None => {
                    if vec_of_parameters.len() != 1 {
                        return Err(ContractBaseError::ParameterInvalid);
                    }
                    let address = match common_logics::convert_hexstring_to_accountid(vec_of_parameters[0].clone()){
                        Some(value) => value,
                        None => return Err(ContractBaseError::ParameterInvalid),
                    };
                    self.proposal_manager_address = Some(address);
                },
            }
            Ok(())
        }

        /// _update_proposal_manager_address
        /// parameters: proposal_manager_address: AccountId
        fn _update_proposal_manager_address(
            &mut self,
            vec_of_parameters: Vec<String>,
            _caller_eoa: AccountId,
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

        /// update member manager
        pub fn _update_member_manager(
            &mut self,
            vec_of_parameters: Vec<String>,
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
            self.member_manager_address = Some(address);
            Ok(())
        }

        fn _create_election(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_election:_create_election[1] ");

            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            };
            ink::env::debug_println!("########## default_election:_create_election[2] ");

            match vec_of_parameters.len() == 1 {
                true => {
                    let proposal_id =
                        match common_logics::convert_string_to_u128(&vec_of_parameters[0]) {
                            Ok(value) => value,
                            Err(error) => return Err(error),
                        };
                    ink::env::debug_println!("########## default_election:_create_election[3] ");

                    let proposal_info = match self._get_proposal_info(proposal_id) {
                        Some(value) => value,
                        None => {
                            return Err(ContractBaseError::Custom("InvalidProposal.".to_string()))
                        }
                    };
                    ink::env::debug_println!("########## default_election:_create_election[4] ");

                    if self.remain_term_electoral_commissioner == 0
                        && proposal_info.kind != ProposalKind::ResetElectionCommisioner
                    {
                        return Err(ContractBaseError::Custom(
                            "YouMutResetElectionCommisioner.".to_string(),
                        ));
                    }
                    ink::env::debug_println!("########## default_election:_create_election[5] ");

                    let election_list = match self._get_election_commisioner_list() {
                        Ok(value) => value,
                        Err(error) => return Err(error),
                    };
                    let election_info: ElectionInfo = ElectionInfo {
                        id: self.next_election_id,
                        proposal_id: proposal_id,
                        minimum_voter_turnout_percentage: self.minimum_voter_turnout_percentage,
                        passing_percentage: self.passing_percentage,
                        number_of_votes: 0,
                        count_of_yes: 0,
                        count_of_no: 0,
                        list_of_voters: Vec::default(),
                        list_of_electoral_commissioner: election_list,
                        is_passed: None,
                    };
                    self.election_list_with_proposal_id
                        .insert(&proposal_id, &election_info);
                    self.election_list_with_election_id
                        .insert(&self.next_election_id, &election_info);
                    self.next_election_id += 1;
                    self.remain_term_electoral_commissioner -= 1;
                    match self._update_proposal_info(proposal_id, 2, caller_eoa) {
                        //2: PropsaolStatus -> Voting
                        Ok(()) => (),
                        Err(error) => {
                            ink::env::debug_println!("########## default_election:_end_election [11] ");
                            return Err(error);
                        },
                    }
                    ink::env::debug_println!("########## default_election:_create_election[6] ");
                }
                false => return Err(ContractBaseError::ParameterInvalid),
            };
            Ok(())
        }

        /// vote: this function is called by application_core
        /// parameter: proposal_id , yes_or_no("yes" or "no" String)
        fn _vote(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_election:_vote [1] ");

            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## default_election:_vote [2] ");

            if vec_of_parameters.len() != 2 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            ink::env::debug_println!("########## default_election:_vote [3] ");

            let proposal_id_string = vec_of_parameters[0].clone();
            let yes_or_no_string = &vec_of_parameters[1].clone();
            let proposal_id = match common_logics::convert_string_to_u128(&proposal_id_string) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            ink::env::debug_println!("########## default_election:_vote [4] ");

            let proposal_info = match self._get_proposal_info(proposal_id) {
                Some(value) => value,
                None => return Err(ContractBaseError::Custom("InvalidProposal.".to_string())),
            };
            ink::env::debug_println!("########## default_election:_vote [5] ");

            if proposal_info.status != ProposalStatus::Voting {
                return Err(ContractBaseError::Custom(
                    "ProposalStatusIsInvalid".to_string(),
                ));
            }
            ink::env::debug_println!("########## default_election:_vote [6] ");

            let mut election_info = match self.election_list_with_proposal_id.get(&proposal_id) {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "ElectionInfoNotFound".to_string(),
                    ))
                }
            };
            ink::env::debug_println!("########## default_election:_vote [7] ");

            if election_info.list_of_voters.contains(&caller_eoa) {
                return Err(ContractBaseError::Custom("YouHaveAlreadyVoted".to_string()));
            }
            ink::env::debug_println!("########## default_election:_vote [8] ");

            match yes_or_no_string.as_str() {
                "yes" => election_info.count_of_yes += 1,
                "no" => election_info.count_of_no += 1,
                _ => return Err(ContractBaseError::ParameterInvalid),
            };
            election_info.number_of_votes += 1;
            election_info.list_of_voters.push(caller_eoa);
            self.election_list_with_proposal_id
                .insert(&proposal_id, &election_info);
            self.election_list_with_election_id
                .insert(&election_info.id, &election_info);
            ink::env::debug_println!("########## default_election:_vote [9] ");
            Ok(())
        }

        // fn _start_election(&mut self, vec_of_parameters: Vec<String>) -> core::result::Result<(), ContractBaseError>{
        //     Ok(())
        // }

        /// end election
        /// parameter: proposal_id
        fn _end_election(
            &mut self,
            vec_of_parameters: Vec<String>,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            ink::env::debug_println!("########## default_election:_end_election [1] ");

            if self._modifier_only_call_from_application_core(self.env().caller()) == false {
                return Err(ContractBaseError::InvalidCallingFromOrigin);
            }
            ink::env::debug_println!("########## default_election:_end_election [2]: vec_of_parameters:{:?}",vec_of_parameters);
            ink::env::debug_println!("########## default_election:_end_election [2]: vec_of_parameters.len():{:?}",vec_of_parameters.len());

            if vec_of_parameters.len() != 1 {
                return Err(ContractBaseError::ParameterInvalid);
            }
            ink::env::debug_println!("########## default_election:_end_election [3] ");

            let number_of_member = match self._get_member_count() {
                Ok(value) => value,
                Err(error) => return Err(error), 
            };
            ink::env::debug_println!("########## default_election:_end_election [4] ");

            let proposal_id_string = vec_of_parameters[0].clone();
            let proposal_id = match common_logics::convert_string_to_u128(&proposal_id_string) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            ink::env::debug_println!("########## default_election:_end_election [5] ");

            let mut election_info = match self.election_list_with_proposal_id.get(&proposal_id) {
                Some(value) => value,
                None => {
                    return Err(ContractBaseError::Custom(
                        "electionDoesNotFound".to_string(),
                    ))
                }
            };
            ink::env::debug_println!("########## default_election:_end_election [6] ");

            match (election_info.number_of_votes / number_of_member * 100)
                >= election_info.minimum_voter_turnout_percentage
            {
                true => {
                    ink::env::debug_println!("########## default_election:_end_election [7] ");
                    match (election_info.count_of_yes / election_info.number_of_votes * 100)
                        >= election_info.passing_percentage
                    {
                        true => {
                            ink::env::debug_println!("########## default_election:_end_election [8] ");
                            election_info.is_passed = Some(true);
                            match self._update_proposal_info(proposal_id, 4, caller_eoa) {
                                //4: ProposalStatus -> Executed
                                Ok(()) => (),
                                Err(error) => {
                                    ink::env::debug_println!("########## default_election:_end_election [9] ");
                                    return Err(error);
                                },
                            }
                        }
                        false => {
                            ink::env::debug_println!("########## default_election:_end_election [10] ");
                            election_info.is_passed = Some(false);
                            match self._update_proposal_info(proposal_id, 5, caller_eoa) {
                                //5: PropsaolStatus -> Denied
                                Ok(()) => (),
                                Err(error) => {
                                    ink::env::debug_println!("########## default_election:_end_election [11] ");
                                    return Err(error);
                                },
                            }
                        }
                    }
                }
                false => {
                    election_info.is_passed = Some(false);
                    match self._update_proposal_info(proposal_id, 5, caller_eoa) {
                        //5: PropsaolStatus -> Denied
                        Ok(()) => (),
                        Err(error) => {
                            ink::env::debug_println!("########## default_election:_end_election [12] ");
                            return Err(error);
                        },
                    }

                }
            }
            self.election_list_with_proposal_id
                .insert(&proposal_id, &election_info);
            self.election_list_with_election_id
                .insert(&election_info.id, &election_info);

            ink::env::debug_println!("########## default_election:_end_election [13] ");
            Ok(())
        }

        /// _update_proposal_info
        fn _update_proposal_info(
            &mut self,
            proposal_id: u128,
            to_status_u8: u8,
            caller_eoa: AccountId
        ) -> core::result::Result<(), ContractBaseError> {
            let proposal_manager_address = match self.proposal_manager_address {
                Some(value) => value,
                None => return Err(ContractBaseError::TheAddressNotFound),
            };

            let params: String = proposal_id.to_string() + "$1$" + &to_status_u8.to_string();

            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(proposal_manager_address);
            match instance.extarnal_execute_interface(
                "change_proposal_status_from_election".to_string(),
                params,
                caller_eoa,
            ) {
                Ok(()) => Ok(()),
                Err(_) => return Err(ContractBaseError::Custom("ExecutionIsFailure".to_string())),
            }

            // let mut instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // instance.call_execute_interface_of_function(
            //     proposal_manager_address,
            //     "change_proposal_status_from_election".to_string(),
            //     params,
            //     self.env().caller(),
            // )
        }

        /// _reset_minimum_voter_turnout_percentage
        /// parameter: minimum_voter_turnout_percentage
        fn _reset_minimum_voter_turnout_percentage(
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
            let percentage = match common_logics::convert_string_to_u64(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };

            self.minimum_voter_turnout_percentage = percentage;
            Ok(())
        }

        /// _reset_passing_percentage
        /// parameter: passing_percentage
        fn _reset_passing_percentage(
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
            let percentage = match common_logics::convert_string_to_u64(&vec_of_parameters[0]) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };

            self.passing_percentage = percentage;
            Ok(())
        }

        fn _get_member_count(&self) -> core::result::Result<u64, ContractBaseError> {
            let mut result:u64 = 0;
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => return Err(ContractBaseError::TheAddressNotFound),
            };

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_member_list".to_string());
            
            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
            //     member_manager_address,
            //     "get_member_list".to_string(),
            // );
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(_value) => result += 1,
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "get_member_list error".to_string(),
                        ))
                    }
                }
            }
            Ok(result)
        }

        fn _get_election_commisioner_list(
            &self,
        ) -> core::result::Result<Vec<AccountId>, ContractBaseError> {
            let mut result: Vec<AccountId> = Vec::new();
            let member_manager_address = match self.member_manager_address {
                Some(value) => value,
                None => return Err(ContractBaseError::TheAddressNotFound),
            };

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_election_commisioner_list".to_string());

            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
            //     member_manager_address,
            //     "get_election_commisioner_list".to_string(),
            // );

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value.address),
                    Err(_) => {
                        return Err(ContractBaseError::Custom(
                            "get_election_commisioner_list error".to_string(),
                        ))
                    }
                }
            }
            Ok(result)
        }

        fn _get_proposal_info(&self, proposal_id: u128) -> Option<ProposalInfo> {
            let proposal_manager_address = match self.proposal_manager_address {
                Some(value) => value,
                None => return None,
            };

            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(proposal_manager_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_proposal_info_list".to_string());

            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_ref);
            // let get_value: Vec<Vec<u8>> = instance.get_data_from_contract(
            //     proposal_manager_address,
            //     "get_proposal_info_list".to_string(),
            // );

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ProposalInfo::decode(&mut array_value.clone()) {
                    Ok(value) => {
                        if value.id == proposal_id {
                            return Some(value);
                        }
                    }
                    Err(_) => return None,
                }
            }
            None
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
            let default_election = DefaultElection::default();
            assert_eq!(default_election.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut default_election = DefaultElection::new(false);
            assert_eq!(default_election.get(), false);
            default_election.flip();
            assert_eq!(default_election.get(), true);
        }
    }
}
