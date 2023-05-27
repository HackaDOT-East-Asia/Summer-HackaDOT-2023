#![cfg_attr(not(feature = "std"), no_std)]

// pub use self::application_core::{ApplicationCore, ApplicationCoreRef};

#[openbrush::contract]
mod application_core {
    // use contract_helper::traits::contract_base::contract_base::contractbase_external::ContractBase;
    use contract_helper::traits::contract_base::contract_base::*;
    use contract_helper::traits::types::types::*;
    use contract_helper::traits::types::types::MemberInfo;
    use default_contract::default_contract::DefaultContractRef;
    use ink::prelude::string::String;
    use ink::prelude::string::ToString;
    use ink::prelude::vec::Vec;
    use ink::storage::traits::StorageLayout;
    use openbrush::{storage::Mapping, traits::Storage};

    //     use communication_base::communication_base::CommunicationBaseRef;
    use scale::Decode;

    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum SoftwareKind {
        MemberManager,
        ProposalManager,
        Election,
        Other,
    }

    #[derive(Debug, Clone, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum SoftwareType {
        PreInstall,
        NormalInstall,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct SoftwareInfo {
        id: u128,
        kind: SoftwareKind,
        software_type: SoftwareType,
        name: String,
        contract_address: AccountId,
        description: String,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        TheSoftwareIsAlreadyInstalled,
        TheSoftwareDoesNotExists,
        CallFromInvalidOrigin,
        UserDoesNotExists,
        TheValueCanSetOnlyOnce,
        TheApplicationCoreAddressStringMustBeSet,
        InvalidTheApplicationCoreAddressString,
        CommunicationBaseCallingError,
        Custom(String),
    }

    pub type Result<T> = core::result::Result<T, Error>;

    #[ink(storage)]
    #[derive(Storage)]
    pub struct ApplicationCore {
        installed_software_list_with_address: Mapping<AccountId, SoftwareInfo>,
        installed_software_list_with_id: Mapping<u128, SoftwareInfo>,
        pre_installed_software_list_with_id: Mapping<u128, SoftwareInfo>,
        next_software_id: u128,
        next_pre_software_id: u128,
        pre_install_member_manager: AccountId,
        pre_install_proposal_manager: AccountId,
        pre_install_election: AccountId,
        //        communication_base_address: Option<AccountId>,
        // appliction_core_address_string: Option<String>,
    }

    impl ApplicationCore {
        #[ink(constructor)]
        // pub fn new(pre_install_member_manger:AccountId, pre_install_proposal_manager:AccountId, pre_install_election:AccountId,
        //     communication_base_address:AccountId) -> Self {
        // pub fn new() -> Self {
        pub fn new(pre_install_member_manger:AccountId, pre_install_proposal_manager:AccountId, pre_install_election:AccountId) -> Self{
            Self {
                installed_software_list_with_address: Mapping::default(),
                installed_software_list_with_id: Mapping::default(),
                pre_installed_software_list_with_id: Mapping::default(),
                next_software_id: 0,
                next_pre_software_id: 0,
                pre_install_member_manager: pre_install_member_manger,
                pre_install_proposal_manager: pre_install_proposal_manager,
                pre_install_election: pre_install_election,        
            }
        }

        #[ink(message)]
        pub fn configure_pre_install_member_manager(&mut self)-> Result<()>{
            ink::env::debug_println!("########## application_core:configure_pre_install_member_manager [1] ###############");
            let software_info = SoftwareInfo {
                id: self.next_pre_software_id,
                kind: SoftwareKind::MemberManager,
                software_type: SoftwareType::PreInstall,
                name: "Member Manager".to_string(),
                description: "PreInstall Member Manager.".to_string(),
                contract_address: self.pre_install_member_manager,
            };
            self.pre_installed_software_list_with_id.insert(&self.next_pre_software_id, &software_info);
            self.next_pre_software_id += 1;
            ink::env::debug_println!("########## application_core:configure_pre_install_member_manager [2] ###############");
            match self._set_address_for_pre_install_contract("set_application_core_address".to_string(), self.pre_install_member_manager, self.env().account_id()){
                Ok(()) => (),
                Err(error) => return Err(error),
            }
            ink::env::debug_println!("########## application_core:configure_pre_install_member_manager [3] ###############");
            self._set_address_for_pre_install_contract("set_proposal_manager_address".to_string(), self.pre_install_member_manager, self.pre_install_proposal_manager)
        }

        #[ink(message)]
        pub fn configure_pre_install_proposal_manager(&mut self)-> Result<()>{
            let software_info = SoftwareInfo {
                id: self.next_pre_software_id,
                kind: SoftwareKind::MemberManager,
                software_type: SoftwareType::PreInstall,
                name: "Proposal Manager".to_string(),
                description: "PreInstall Proposal Manager.".to_string(),
                contract_address: self.pre_install_proposal_manager,
            };
            self.pre_installed_software_list_with_id.insert(&self.next_pre_software_id, &software_info);
            self.next_pre_software_id += 1;
            match self._set_address_for_pre_install_contract("set_application_core_address".to_string(), self.pre_install_proposal_manager, self.env().account_id()) {
                Ok(()) => (),
                Err(error) => return Err(error),
            }
            match self._set_address_for_pre_install_contract("set_member_manager_address".to_string(), self.pre_install_proposal_manager, self.pre_install_member_manager){
                Ok(()) => (),
                Err(error) => return Err(error),
            }
            self._set_address_for_pre_install_contract("set_election_manager_address".to_string(), self.pre_install_proposal_manager, self.pre_install_election)
        }

        #[ink(message)]
        pub fn configure_pre_install_election(&mut self)-> Result<()>{
            let software_info = SoftwareInfo {
                id: self.next_pre_software_id,
                kind: SoftwareKind::MemberManager,
                software_type: SoftwareType::PreInstall,
                name: "Election Manager".to_string(),
                description: "PreInstall Election Manager.".to_string(),
                contract_address: self.pre_install_election,
            };
            self.pre_installed_software_list_with_id.insert(&self.next_pre_software_id, &software_info);
            self.next_pre_software_id += 1;
            match self._set_address_for_pre_install_contract("set_application_core_address".to_string(), self.pre_install_election, self.env().account_id()){
                Ok(()) => (),
                Err(error) => return Err(error),
            }
            match self._set_address_for_pre_install_contract("set_member_manager_address".to_string(), self.pre_install_election, self.pre_install_member_manager){
                Ok(()) => (),
                Err(error) => return Err(error), 
            }
            self._set_address_for_pre_install_contract("set_proposal_manager_address".to_string(), self.pre_install_election, self.pre_install_proposal_manager)
        }

        // #[ink(message)]
        // pub fn set_appliction_core_address_string(&mut self, address_string:String) -> Result<()>{
        //     match self.appliction_core_address_string{
        //         Some(_) => return Err(Error::TheValueCanSetOnlyOnce),
        //         None => self.appliction_core_address_string = Some(address_string),
        //     }
        //     Ok(())
        // }

        #[ink(message)]
        pub fn get_installed_software(&self) -> Vec<SoftwareInfo> {
            let mut result: Vec<SoftwareInfo> = Vec::new();
            for i in 0..self.next_software_id {
                match self.installed_software_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        #[ink(message)]
        pub fn get_pre_installed_software(&self) -> Vec<SoftwareInfo> {
            let mut result: Vec<SoftwareInfo> = Vec::new();
            for i in 0..self.next_pre_software_id {
                match self.pre_installed_software_list_with_id.get(&i) {
                    Some(value) => result.push(value),
                    None => (),
                }
            }
            result
        }

        /// parameter_dsv: Specify the delimiter in the "$X$" format. ex1) "aaa$1$bbb" ex2) "aaa$1$bbb$1$ccc$2$ddd"
        #[ink(message)]
        pub fn execute_interface(
            &mut self,
            target_contract_address: AccountId,
            function_name: String,
            parameter_dsv: String,
        ) -> Result<()> {
            ink::env::debug_println!(
                "########## application_core:execute_interface [0] ###############"
            );
            if self._modifier_only_call_from_member_eoa() == false {
                return Err(Error::CallFromInvalidOrigin);
            }
            ink::env::debug_println!(
                "########## application_core:execute_interface [0.5] ###############"
            );
            if self._check_installed_software(target_contract_address) == false {
                return Err(Error::TheSoftwareDoesNotExists);
            }
            ink::env::debug_println!(
                "########## application_core:execute_interface [1] ###############: caller:{:?}",
                self.env().caller()
            );
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(target_contract_address);
            match instance.extarnal_execute_interface(
                function_name,
                parameter_dsv,
                self.env().caller()
            ) {
                Ok(()) => Ok(()),
                Err(_) => return Err(Error::Custom("ExecutionIsFailure".to_string())),
            }

            // let mut instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_address.unwrap());
            // match instance.call_execute_interface_of_function(
            //     target_contract_address,
            //     function_name,
            //     parameter_dsv,
            //     self.env().caller()
            // ){
            //     Ok(()) => Ok(()),
            //     Err(_) => return Err(Error::Custom("ExecutionIsFailure".to_string())),
            // }
        }

        
        // #[ink(message)]
        // pub fn call_point_from_proposal(&mut self, target_function:String, parameters:String) -> Result<()>{
        //     ink::env::debug_println!("########## application_core:call_point_from_proposal [1] ");
        //     if self._modifier_only_call_from_proposal() == false {
        //         return Err(Error::CallFromInvalidOrigin);
        //     }
        //     ink::env::debug_println!("########## application_core:call_point_from_proposal [2] ");
        //     match target_function.as_str(){
        //         "install_software" => self._install_software(parameters),
        //         "uninstall_software" => self._uninstall_software(parameters),
        //         _ => return Err(Error::Custom("TargetFunctionIsInvalid.".to_string())),
        //     }
        // }

        // fn _install_software(&mut self, parameters:String) -> Result<()> {
        //     ink::env::debug_println!("########## application_core:_install_software [1] ");

        //     ink::env::debug_println!("########## application_core:_install_software [2] ");
        //     let parameters_of_vec = common_logics::change_dsv_string_to_vec_of_string(
        //         parameters,
        //         "$1$".to_string(),
        //     );
        //     if parameters_of_vec.len() != 4 {
        //         return Err(Error::Custom("InvalidProposal".to_string()));
        //     }
        //             ink::env::debug_println!(
        //                 "########## application_core:_install_software [3] "
        //             );

        //             let contract_address =
        //                 match common_logics::convert_string_to_accountid(&parameters_of_vec[3]) {
        //                     Some(value) => value,
        //                     None => return Err(Error::Custom("InvalidProposal".to_string())),
        //                 };
        //             ink::env::debug_println!(
        //                 "########## application_core:_install_software [4] "
        //             );

        //             let software_info = SoftwareInfo {
        //                 id: self.next_software_id,
        //                 kind: self._change_string_2_software_kind(&parameters_of_vec[0]),
        //                 software_type: SoftwareType::NormalInstall,
        //                 name: parameters_of_vec[1].clone(),
        //                 description: parameters_of_vec[2].clone(),
        //                 contract_address: contract_address,
        //             };
        //             ink::env::debug_println!("########## application_core:_install_software [5]");
                    

        //     match self
        //         .installed_software_list_with_address
        //         .get(&software_info.contract_address)
        //     {
        //         Some(_) => return Err(Error::TheSoftwareIsAlreadyInstalled),
        //         None => {
        //             match software_info.kind {
        //                 SoftwareKind::ProposalManager
        //                 | SoftwareKind::MemberManager
        //                 | SoftwareKind::Election => match self
        //                     ._uninstall_present_proposal_memeber_election(software_info.id)
        //                 {
        //                     Ok(()) => (),
        //                     Err(error) => return Err(error),
        //                 },
        //                 _ => (),
        //             }
        //             self.installed_software_list_with_id
        //                 .insert(&self.next_software_id, &software_info);
        //             self.installed_software_list_with_address
        //                 .insert(&software_info.contract_address.clone(), &software_info);
        //             ink::env::debug_println!("########## application_core:install_software [4] ");
        //             match self._set_application_core_address(software_info.contract_address) {
        //                 Ok(()) => (),
        //                 Err(error) => return Err(error),
        //             }
        //             // todo: update proposal status Executed -> Finished
        //             self.next_software_id += 1;
        //             ink::env::debug_println!("########## application_core:install_software [5] ");
        //             Ok(())
        //         }
        //     }
        // }

        // fn _uninstall_software(&mut self, parameters:String) -> Result<()> {
        //     let parameters_of_vec = common_logics::change_dsv_string_to_vec_of_string(
        //         parameters,
        //         "$1$".to_string(),
        //     );
        //     if parameters_of_vec.len() != 1 {
        //         return Err(Error::Custom("InvalidProposal".to_string()));
        //     }
        //     let software_id = match common_logics::convert_string_to_u128(&parameters_of_vec[0]) {
        //         Ok(value) => value,
        //         Err(_) => return Err(Error::Custom("InvalidProposal".to_string())),
        //     };
        //     self._uninstall_software_impl(software_id)
        // }

        #[ink(message)]
        pub fn install_software(&mut self, proposal_id: u128) -> Result<()> {
            ink::env::debug_println!("########## application_core:install_software [1] ");
            if self._modifier_only_call_from_member_eoa() == false {
                return Err(Error::CallFromInvalidOrigin);
            }
            // match self._check_applicaiton_core_address_string() {
            //     Ok(()) => (),
            //     Err(error) => return Err(error),
            // }
            ink::env::debug_println!("########## application_core:install_software [2] ");
            let software_info = match self._get_proposal_info_and_create_software_info(proposal_id)
            {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            ink::env::debug_println!("########## application_core:install_software [3] ");
            match self
                .installed_software_list_with_address
                .get(&software_info.contract_address)
            {
                Some(_) => return Err(Error::TheSoftwareIsAlreadyInstalled),
                None => {
                    match software_info.kind {
                        SoftwareKind::ProposalManager
                        | SoftwareKind::MemberManager
                        | SoftwareKind::Election => match self
                            ._uninstall_present_proposal_memeber_election(software_info.id)
                        {
                            Ok(()) => (),
                            Err(error) => return Err(error),
                        },
                        _ => (),
                    }
                    self.installed_software_list_with_id
                        .insert(&self.next_software_id, &software_info);
                    self.installed_software_list_with_address
                        .insert(&software_info.contract_address.clone(), &software_info);
                    ink::env::debug_println!("########## application_core:install_software [4] ");
                    match self._set_address_for_pre_install_contract("set_application_core_address".to_string(),software_info.contract_address, self.env().account_id()) {
                        Ok(()) => (),
                        Err(error) => return Err(error),
                    }
                    // todo: update proposal status Executed -> Finished
                    self.next_software_id += 1;
                    ink::env::debug_println!("########## application_core:install_software [5] ");
                    Ok(())
                }
            }
        }

        #[ink(message)]
        pub fn uninstall_software(&mut self, target_proposal_id: u128) -> Result<()> {
            if self._modifier_only_call_from_member_eoa() == false {
                return Err(Error::CallFromInvalidOrigin);
            }
            // match self._check_applicaiton_core_address_string() {
            //     Ok(()) => (),
            //     Err(error) => return Err(error),
            // }
            let proposal_info = match self._get_proposal_info(target_proposal_id) {
                Ok(value) => value,
                Err(error) => return Err(error),
            };
            if proposal_info.target_contract != self.env().account_id() {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            if proposal_info.target_function != "uninstall_software" {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }

            let params = common_logics::change_dsv_string_to_vec_of_string(
                proposal_info.parameters,
                "$1$".to_string(),
            );
            if params.len() != 1 {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            let software_id = match common_logics::convert_string_to_u128(&params[0]) {
                Ok(value) => value,
                Err(_) => return Err(Error::Custom("InvalidProposal".to_string())),
            };
            self._uninstall_software_impl(software_id)
        }

        #[ink(message)]
        pub fn get_proposal_info_list(&self) -> Vec<ProposalInfo> {
            self._get_proposal_info_list()
        }

        #[ink(message)]
        pub fn get_member_list(&self) -> Vec<MemberInfo> {
            self._get_member_info_list()
        }

        #[ink(message)]
        pub fn get_election_commision_list(&self) -> Vec<MemberInfo> {
            self._get_election_commision_list()
        }

        #[ink(message)]
        pub fn check_election_commisioner(&self) -> bool {
            let list = self._get_election_commision_list();
            for member_info in list {
                if member_info.address == self.env().caller() {
                    return true;
                }
            }
            false
        }

        #[ink(message)]
        pub fn get_election_info_list(&self) -> Vec<ElectionInfo> {
            self._get_election_info_list()
        }

        fn _uninstall_software_impl(&mut self, software_id: u128) -> Result<()> {
            let software_info = match self.installed_software_list_with_id.get(&software_id) {
                Some(value) => value,
                None => return Err(Error::Custom("InvalidSoftwareId".to_string())),
            };

            self.installed_software_list_with_address
                .remove(&software_info.contract_address);
            self.installed_software_list_with_id.remove(&software_id);
            // todo: update proposal status Executed -> Finished
            Ok(())
        }

        fn _uninstall_present_proposal_memeber_election(
            &mut self,
            software_id: u128,
        ) -> Result<()> {
            let software_list = self.get_installed_software();
            for software in software_list {
                if software.id == software_id {
                    self.installed_software_list_with_address
                        .remove(&software.contract_address);
                    self.installed_software_list_with_id.remove(&software_id);
                }
            }
            Ok(())
        }

        // fn _check_software_interface(interface_list: Vec<String>) -> Result<()> {
        //     // 各softwareのexecute_interfaceの存在の有無を確認する。
        //     Ok(())
        // }

        fn _set_address_for_pre_install_contract(&self, target_function: String, target_contract_address: AccountId, paramter_address: AccountId) -> Result<()> {
            // let address_string = match &self.appliction_core_address_string {
            //     Some(value) => value,
            //     None => return Err(Error::TheApplicationCoreAddressStringMustBeSet),
            // };
            let address_string = hex::encode(paramter_address);
            let mut instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(target_contract_address);
            match instance.extarnal_execute_interface(
                target_function,
                address_string.to_string(),
                self.env().caller()
            ) {
                Ok(()) => Ok(()),
                Err(_) => Err(Error::CommunicationBaseCallingError),
            }

            // let mut instance: CommunicationBaseRef =
            // ink::env::call::FromAccountId::from_account_id(
            //     self.communication_base_address.unwrap(),
            // );
            // match instance.call_execute_interface_of_function(
            //     target_contract_address,
            //     "set_dao_address".to_string(),
            //     address_string.to_string(),
            //     self.env().caller()
            // ) {
            //     Ok(()) => Ok(()),
            //     Err(_) => Err(Error::CommunicationBaseCallingError),
            // }
        }

        fn _modifier_only_call_from_member_eoa(&self) -> bool {
            let member_list = self._get_member_info_list();
            for member_info in member_list {
                if member_info.address == self.env().caller() {
                    return true;
                };
            }
            false
        }

        fn _get_member_info_list(&self) -> Vec<MemberInfo> {
            let member_manager_address = self._get_member_manager_address();
            let mut result: Vec<MemberInfo> = Vec::new();
            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_address.unwrap());
            // let get_value: Vec<Vec<u8>> = instance
            //     .get_data_from_contract(member_manager_address, "get_member_list".to_string());
            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_member_list".to_string());

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => (),
                };
            }
            result
        }

        fn _get_election_commision_list(&self) -> Vec<MemberInfo> {
            let member_manager_address = self._get_member_manager_address();
            let mut result: Vec<MemberInfo> = Vec::new();
            // let instance: CommunicationBaseRef =
            //     ink::env::call::FromAccountId::from_account_id(self.communication_base_address.unwrap());
            // let get_value: Vec<Vec<u8>> = instance
            //     .get_data_from_contract(member_manager_address, "get_member_list".to_string());
            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(member_manager_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_election_commisioner_list".to_string());

            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match MemberInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => (),
                };
            }
            result
        }

        fn _get_member_manager_address(&self) -> AccountId {
            let list = self.get_installed_software();
            for info in list {
                if info.kind == SoftwareKind::MemberManager {
                    return info.contract_address;
                }
            }
            return self.pre_install_member_manager;
        }

        fn _get_proposal_info_and_create_software_info(
            &self,
            proposal_id: u128,
        ) -> core::result::Result<SoftwareInfo, Error> {
            ink::env::debug_println!(
                "########## application_core:_get_proposal_info_and_create_software_info [1] "
            );
            match self._get_proposal_info(proposal_id) {
                Ok(value) => self._create_software_info_by_proposal_info(value),
                Err(error) => Err(error),
            }
        }

        fn _get_election_info_list(&self) -> Vec<ElectionInfo> {
            let mut result:Vec<ElectionInfo> = Vec::new();
            let election_address = self._get_election_address();
            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(election_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_election_info_list".to_string());
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ElectionInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => (),
                }
            }
            result
        }

        fn _get_proposal_info_list(&self) -> Vec<ProposalInfo> {
            let mut result:Vec<ProposalInfo> = Vec::new();
            let proposal_manager_address = self._get_proposal_manager_address();
            let instance: DefaultContractRef =
                ink::env::call::FromAccountId::from_account_id(proposal_manager_address);
            let get_value: Vec<Vec<u8>> = instance.extarnal_get_data_interface("get_proposal_info_list".to_string());
            for value in get_value.iter() {
                let array_value: &[u8] = value.as_slice().try_into().unwrap();
                match ProposalInfo::decode(&mut array_value.clone()) {
                    Ok(value) => result.push(value),
                    Err(_) => (),
                }
            }
            result
        }

        fn _get_proposal_info(
            &self,
            proposal_id: u128,
        ) -> core::result::Result<ProposalInfo, Error> {
            let proposal_info_list = self._get_proposal_info_list();
            for value in proposal_info_list.iter() {
                if value.id == proposal_id {
                    if value.status != ProposalStatus::Executed {
                        return Err(Error::Custom(
                            "ThisProposalStatusIdNotExecuted.".to_string(),
                        ));
                    } else {
                        return Ok(value.clone());
                    }
                }
            }
            return Err(Error::Custom("TargetProposalDoesNotFind".to_string()));
        }

        fn _create_software_info_by_proposal_info(
            &self,
            proposal_info: ProposalInfo,
        ) -> core::result::Result<SoftwareInfo, Error> {
            ink::env::debug_println!(
                "########## application_core:_create_software_info_by_proposal_info [1] "
            );
            if proposal_info.target_contract != self.env().account_id() {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            ink::env::debug_println!(
                "########## application_core:_create_software_info_by_proposal_info [2] "
            );
            if proposal_info.target_function != "install_software" {
                return Err(Error::Custom("InvalidProposal".to_string()));
            }
            ink::env::debug_println!(
                "########## application_core:_create_software_info_by_proposal_info [3] "
            );
            let parameters = common_logics::change_dsv_string_to_vec_of_string(
                proposal_info.parameters,
                "$1$".to_string(),
            );
            match parameters.len() == 4 {
                true => {
                    ink::env::debug_println!(
                        "########## application_core:_create_software_info_by_proposal_info [4] "
                    );

                    let contract_address =
                        match common_logics::convert_string_to_accountid(&parameters[3]) {
                            Some(value) => value,
                            None => return Err(Error::Custom("InvalidProposal".to_string())),
                        };
                    ink::env::debug_println!(
                        "########## application_core:_create_software_info_by_proposal_info [5] "
                    );

                    let result = SoftwareInfo {
                        id: self.next_software_id,
                        kind: self._change_string_2_software_kind(&parameters[0]),
                        software_type: SoftwareType::NormalInstall,
                        name: parameters[1].clone(),
                        description: parameters[2].clone(),
                        contract_address: contract_address,
                    };
                    ink::env::debug_println!("########## application_core:_create_software_info_by_proposal_info [6]:SoftwareInfo:{:?} ",result);
                    return Ok(result);
                }
                false => return Err(Error::Custom("InvalidProposal".to_string())),
            }
        }

        fn _change_string_2_software_kind(&self, string_value: &String) -> SoftwareKind {
            match string_value.as_str() {
                "MemberManager" => SoftwareKind::MemberManager,
                "ProposalManager" => SoftwareKind::ProposalManager,
                "Election" => SoftwareKind::Election,
                _ => SoftwareKind::Other,
            }
        }

        fn _get_proposal_manager_address(&self) -> AccountId {
            let list = self.get_installed_software();
            for info in list {
                if info.kind == SoftwareKind::ProposalManager {
                    return info.contract_address;
                }
            }
            return self.pre_install_proposal_manager;
        }

        fn _get_election_address(&self) -> AccountId {
            let list = self.get_installed_software();
            for info in list {
                if info.kind == SoftwareKind::Election {
                    return info.contract_address;
                }
            }
            return self.pre_install_election;
        }

        fn _check_installed_software(&self, taraget_contract_address:AccountId) -> bool {
            if taraget_contract_address == self.pre_install_election ||
                taraget_contract_address == self.pre_install_member_manager ||
                taraget_contract_address == self.pre_install_proposal_manager {
                    return true;
            }
            self.installed_software_list_with_address.contains(&taraget_contract_address)
        }

        fn _modifier_only_call_from_proposal(&self) -> bool {
            self._get_proposal_manager_address() == self.env().caller()
        }

        // fn _check_applicaiton_core_address_string(&self) -> Result<()> {
        //     let address_sting =  match &self.appliction_core_address_string  {
        //         Some(value) => value,
        //         None => return Err(Error::TheApplicationCoreAddressStringMustBeSet),
        //     };

        //     let tmp = match common_logics::convert_string_to_accountid(&address_sting){
        //         Some(value) => value,
        //         None => return Err(Error::Custom("MayBeInvalidAddressStringWasSet".to_string())),
        //     };
        //     match tmp == self.env().account_id() {
        //         true => Ok(()),
        //         false => return Err(Error::InvalidTheApplicationCoreAddressString),
        //     }
        // }
    }
}
