#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod marketplace {
    use ink::{
        codegen::{EmitEvent, Env},
        env::DefaultEnvironment,
        EnvAccess,
    };
    use openbrush::{
        contracts::{ownable::*, psp34::Id, reentrancy_guard::*},
        modifiers,
        traits::{Storage, String},
    };
    use pallet_marketplace::{
        impls::marketplace::{marketplace_sale::MarketplaceSaleEvents, types::MarketplaceError, *},
        traits::marketplace::*,
    };

    // MarketplaceContract contract storage
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct MarketplaceContract {
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        guard: reentrancy_guard::Data,
        #[storage_field]
        marketplace: types::Data,
    }

    /// Event emitted when token is listed or unlisted
    #[ink(event)]
    pub struct TokenListed {
        #[ink(topic)]
        contract: AccountId,
        #[ink(topic)]
        id: Id,
        #[ink(topic)]
        price: Option<Balance>,
    }

    /// Event emitted when deposit for offer
    #[ink(event)]
    pub struct Deposit {
        #[ink(topic)]
        account_id: AccountId,
        #[ink(topic)]
        amount: Balance,
    }

    /// Event emitted when withdraw for offer
    #[ink(event)]
    pub struct Withdraw {
        #[ink(topic)]
        account_id: AccountId,
        #[ink(topic)]
        amount: Balance,
    }

    /// Event emitted when make offer
    #[ink(event)]
    pub struct MakeOffer {
        #[ink(topic)]
        offer_id: u128,
        #[ink(topic)]
        contract: AccountId,
        #[ink(topic)]
        id: Option<Id>,
        bidder_id: AccountId,
        price_per_item: Balance,
        quantity: u64,
        extra: String,
    }

    #[ink(event)]
    pub struct CancelOffer {
        #[ink(topic)]
        offer_id: u128,
    }

    #[ink(event)]
    pub struct AcceptOffer {
        #[ink(topic)]
        offer_id: u128,
    }

    /// Event emitted when a token is bought
    #[ink(event)]
    pub struct TokenBought {
        #[ink(topic)]
        contract: AccountId,
        #[ink(topic)]
        id: Id,
        #[ink(topic)]
        price: Balance,
        from: AccountId,
        to: AccountId,
    }

    /// Event emitted when a NFT contract is registered to the marketplace.
    #[ink(event)]
    pub struct CollectionRegistered {
        #[ink(topic)]
        contract: AccountId,
    }

    impl MarketplaceContract {
        #[ink(constructor)]
        pub fn new(market_fee_recipient: AccountId) -> Self {
            let mut instance = Self::default();
            instance.marketplace.fee = 100; // 1%
            instance.marketplace.max_fee = 1000; // 10%
            instance.marketplace.market_fee_recipient = Option::Some(market_fee_recipient);

            let caller = instance.env().caller();
            instance._init_with_owner(caller);
            instance
        }

        #[ink(message)]
        #[modifiers(only_owner)]
        pub fn set_code(&mut self, code_hash: [u8; 32]) -> Result<(), MarketplaceError> {
            ink::env::set_code_hash(&code_hash).unwrap_or_else(|err| {
                panic!(
                    "Failed to `set_code_hash` to {:?} due to {:?}",
                    code_hash, err
                )
            });
            ink::env::debug_println!("Switched code hash to {:?}.", code_hash);
            Ok(())
        }
    }

    impl MarketplaceSaleEvents for MarketplaceContract {
        fn emit_token_listed_event(
            &self,
            contract: AccountId,
            token_id: Id,
            price: Option<Balance>,
        ) {
            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<MarketplaceContract>>::emit_event::<
                TokenListed,
            >(
                self.env(),
                TokenListed {
                    contract,
                    id: token_id,
                    price,
                },
            );
        }

        fn emit_token_bought_event(
            &self,
            contract: AccountId,
            token_id: Id,
            price: Balance,
            from: AccountId,
            to: AccountId,
        ) {
            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<MarketplaceContract>>::emit_event::<
                TokenBought,
            >(
                self.env(),
                TokenBought {
                    contract,
                    id: token_id,
                    price,
                    from,
                    to,
                },
            );
        }

        fn emit_collection_registered_event(&self, contract: AccountId) {
            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<MarketplaceContract>>::emit_event::<
                CollectionRegistered,
            >(self.env(), CollectionRegistered { contract })
        }

        fn emit_deposit_event(&self, account_id: AccountId, amount: Balance) {
            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<MarketplaceContract>>::emit_event::<
                Deposit,
            >(self.env(), Deposit { account_id, amount })
        }

        fn emit_withdraw_event(&self, account_id: AccountId, amount: Balance) {
            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<MarketplaceContract>>::emit_event::<
                Withdraw,
            >(self.env(), Withdraw { account_id, amount })
        }

        fn emit_make_offer_event(
            &self,
            bidder_id: AccountId,
            contract: AccountId,
            token_id: Option<Id>,
            quantity: u64,
            price_per_item: u128,
            extra: String,
            offer_id: u128,
        ) {
            <EnvAccess<'_, DefaultEnvironment> as EmitEvent<MarketplaceContract>>::emit_event::<
                MakeOffer,
            >(
                self.env(),
                MakeOffer {
                    offer_id,
                    contract,
                    id: token_id,
                    bidder_id,
                    price_per_item,
                    quantity,
                    extra,
                },
            )
        }
    }

    impl MarketplaceSale for MarketplaceContract {}

    // ***************************** Tests *******************************
    #[cfg(test)]
    mod tests {
        use super::*;
        use crate::marketplace::MarketplaceContract;
        use ink::env::test;
        use openbrush::contracts::psp34::Id;
        use pallet_marketplace::impls::marketplace::types::{MarketplaceError, NftContractType};

        #[ink::test]
        fn new_works() {
            let marketplace = init_contract();
            assert_eq!(marketplace.get_marketplace_fee(), 100);
            assert_eq!(marketplace.get_max_fee(), 1000);
            assert_eq!(marketplace.get_fee_recipient(), fee_recipient());
        }

        #[ink::test]
        fn set_marketplace_fee_works() {
            let mut marketplace = init_contract();

            assert!(marketplace.set_marketplace_fee(120).is_ok());
            assert_eq!(marketplace.get_marketplace_fee(), 120);
        }

        #[ink::test]
        fn set_marketplace_fee_fails_if_not_owner() {
            let mut marketplace = init_contract();

            let accounts = default_accounts();
            set_sender(accounts.bob);
            assert_eq!(
                marketplace.set_marketplace_fee(120),
                Err(MarketplaceError::OwnableError(
                    OwnableError::CallerIsNotOwner
                ))
            );
        }

        #[ink::test]
        fn set_marketplace_fee_fails_if_fee_too_high() {
            let mut marketplace = init_contract();

            assert_eq!(
                marketplace.set_marketplace_fee(1001),
                Err(MarketplaceError::FeeTooHigh)
            );
            assert!(marketplace.set_marketplace_fee(1000).is_ok());
        }

        #[ink::test]
        fn set_fee_recipient_works() {
            let mut marketplace = init_contract();
            let accounts = default_accounts();

            assert!(marketplace.set_fee_recipient(accounts.bob).is_ok());
            assert_eq!(marketplace.get_fee_recipient(), accounts.bob);
        }

        #[ink::test]
        fn set_fee_recipient_fails_if_not_owner() {
            let mut marketplace = init_contract();
            let accounts = default_accounts();
            set_sender(accounts.bob);

            assert_eq!(
                marketplace.set_fee_recipient(accounts.bob),
                Err(MarketplaceError::OwnableError(
                    OwnableError::CallerIsNotOwner
                ))
            );
        }

        #[ink::test]
        fn buy_fails_if_unlisted_token() {
            let mut marketplace = init_contract();

            assert_eq!(
                marketplace.buy(contract_address(), Id::U128(1)),
                Err(MarketplaceError::ItemNotListedForSale)
            );
        }

        #[ink::test]
        fn register_contract_works() {
            let mut marketplace = init_contract();

            assert!(marketplace
                .register(
                    contract_address(),
                    Some(fee_recipient()),
                    Some(999),
                    NftContractType::Psp34
                )
                .is_ok());
            let contract = marketplace
                .get_registered_collection(contract_address())
                .unwrap();
            assert_eq!(contract.royalty.unwrap().0, fee_recipient());
            assert_eq!(contract.royalty.unwrap().1, 999);
            assert_eq!(1, ink::env::test::recorded_events().count());
        }

        #[ink::test]
        fn register_fails_if_fee_too_high() {
            let mut marketplace = init_contract();

            assert_eq!(
                marketplace.register(
                    contract_address(),
                    Some(fee_recipient()),
                    Some(1001),
                    NftContractType::Psp34
                ),
                Err(MarketplaceError::FeeTooHigh)
            );
            assert!(marketplace
                .register(
                    contract_address(),
                    Some(fee_recipient()),
                    Some(999),
                    NftContractType::Psp34
                )
                .is_ok());
        }

        #[ink::test]
        fn register_fails_if_contract_already_registered() {
            let mut marketplace = init_contract();

            assert!(marketplace
                .register(
                    contract_address(),
                    Some(fee_recipient()),
                    Some(999),
                    NftContractType::Psp34
                )
                .is_ok());
            assert_eq!(
                marketplace.register(
                    contract_address(),
                    Some(fee_recipient()),
                    Some(999),
                    NftContractType::Psp34
                ),
                Err(MarketplaceError::ContractAlreadyRegistered)
            );
        }

        #[ink::test]
        fn set_nft_contract_hash_works() {
            let mut marketplace = init_contract();
            let hash = Hash::try_from([1; 32]).unwrap();
            let hash2 = Hash::try_from([2; 32]).unwrap();

            assert!(marketplace
                .set_nft_contract_hash(NftContractType::Rmrk, hash)
                .is_ok());
            assert_eq!(marketplace.nft_contract_hash(NftContractType::Rmrk), hash);

            // Check also if owner is able to update hash.
            assert!(marketplace
                .set_nft_contract_hash(NftContractType::Rmrk, hash2)
                .is_ok());
            assert_eq!(marketplace.nft_contract_hash(NftContractType::Rmrk), hash2);
        }

        #[ink::test]
        fn set_nft_contract_fails_if_not_owner() {
            let mut marketplace = init_contract();
            let hash = Hash::try_from([1; 32]).unwrap();
            let accounts = default_accounts();
            set_sender(accounts.bob);

            assert_eq!(
                marketplace.set_nft_contract_hash(NftContractType::Rmrk, hash),
                Err(MarketplaceError::OwnableError(
                    OwnableError::CallerIsNotOwner
                ))
            );
        }

        fn init_contract() -> MarketplaceContract {
            MarketplaceContract::new(fee_recipient())
        }

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<Environment>()
        }

        fn set_sender(sender: AccountId) {
            ink::env::test::set_caller::<ink::env::DefaultEnvironment>(sender);
        }

        fn fee_recipient() -> AccountId {
            AccountId::from([0x1; 32])
        }

        fn contract_address() -> AccountId {
            AccountId::from([0x2; 32])
        }
    }
}
