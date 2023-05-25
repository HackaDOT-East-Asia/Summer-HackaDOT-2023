use ink::prelude::string::String;

#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum ContractBaseError {
    CommnadNotFound,
    ParameterInvalid,
    InvalidCallingFromOrigin,
    TragetDataNotFound,
    ContractNotFound,
    TheAddressNotFound,
    SetTheAddressOnlyOnece,
    Custom(String),
}
