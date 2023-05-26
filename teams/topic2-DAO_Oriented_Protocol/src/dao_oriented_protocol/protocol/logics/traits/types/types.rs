use ink::storage::traits::StorageLayout;
use ink::prelude::string::{String};
use ink::prelude::vec::Vec;
use openbrush::traits::AccountId;

#[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
#[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
pub struct MemberInfo {
    pub id: u128,
    pub name: String,
    pub address: AccountId,
}

#[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
#[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
pub struct ProposalInfo {
    pub id: u128,
    pub kind: ProposalKind,
    pub title: String,
    pub outline: String,
    pub description: String,
    pub github_url: String,
    pub target_contract: AccountId,
    pub target_function: String,
    pub parameters: String,
    pub status: ProposalStatus,
}

#[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
#[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
pub enum ProposalKind {
    /// initial value
    None,
    /// Reset Election Commisioner
    ResetElectionCommisioner,
    /// Other
    Other,
}

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub enum ProposalStatus {
        /// initial value
        None,
        /// proposed
        Proposed,
        /// voting
        Voting,
        /// Finish Voting
        FinishVoting,
        /// executed
        Executed,
        /// denied
        Denied,
        /// Finished
        Finished,
    }

    #[derive(Debug, Clone, scale::Encode, scale::Decode, PartialEq)]
    #[cfg_attr(feature = "std", derive(StorageLayout, scale_info::TypeInfo))]
    pub struct ElectionInfo {
        pub id: u128,
        pub proposal_id: u128,
        pub minimum_voter_turnout_percentage: u64,
        pub passing_percentage: u64,
        pub number_of_votes: u64,
        pub count_of_yes: u64,
        pub count_of_no: u64,
        pub list_of_voters: Vec<AccountId>,
        pub list_of_electoral_commissioner: Vec<AccountId>,
        pub is_passed: Option<bool>,
    }
