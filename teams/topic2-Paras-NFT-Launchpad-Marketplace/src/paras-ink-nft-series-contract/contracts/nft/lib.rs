#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

#[openbrush::contract]
pub mod nft {
    use ink::codegen::{EmitEvent, Env};
    use ink::prelude::string::String as PreludeString;
    use ink::prelude::vec::Vec;
    use openbrush::{
        contracts::{
            ownable::*,
            psp34::extensions::{burnable::*, enumerable::*, metadata::*},
            reentrancy_guard::*,
        },
        modifiers,
        traits::{Storage, String},
    };

    pub use nft_series_pkg::{
        impls::nft_series::*,
        traits::{nft_series::*, psp34_traits::*},
    };

    // NFTContract contract storage
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct NFTContract {
        #[storage_field]
        psp34: psp34::Data<enumerable::Balances>,
        #[storage_field]
        guard: reentrancy_guard::Data,
        #[storage_field]
        ownable: ownable::Data,
        #[storage_field]
        metadata: metadata::Data,
        #[storage_field]
        nft_series: types::Data,
    }

    impl PSP34 for NFTContract {}
    impl PSP34Burnable for NFTContract {}
    impl PSP34Enumerable for NFTContract {}
    impl PSP34Metadata for NFTContract {}
    impl Psp34Traits for NFTContract {}
    impl Ownable for NFTContract {}

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        id: Id,
    }

    /// Event emitted when a token approve occurs.
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        id: Option<Id>,
        approved: bool,
    }

    #[ink(event)]
    pub struct NFTCreateCollection {
        #[ink(topic)]
        collection_id: u64,
        creator_address: AccountId,
        title: Option<PreludeString>,
        description: Option<PreludeString>,
        media: Option<PreludeString>,
        cover: Option<PreludeString>,
        twitter: Option<PreludeString>,
        website: Option<PreludeString>,
    }

    #[ink(event)]
    pub struct NFTCreateSeries {
        #[ink(topic)]
        token_series_id: u64,
        base_uri: PreludeString,
        price: Option<Balance>,
        copies: u64,
        royalty: Vec<(AccountId, u32)>,
        iterative: bool,
        creator_address: AccountId,
        collection_id: u64,
    }

    #[ink(event)]
    pub struct NFTSetSeriesPrice {
        #[ink(topic)]
        token_series_id: u64,
        price: Option<Balance>,
    }

    #[ink(event)]
    pub struct NFTDecreaseSeriesCopies {
        #[ink(topic)]
        token_series_id: u64,
        copies_after: u64,
    }

    #[ink(event)]
    pub struct NFTSeriesBuy {
        #[ink(topic)]
        token_id: u64,
        token_series_id: u64,
        to: AccountId,
        price: Balance,
    }

    impl NFTContract {
        #[ink(constructor)]
        pub fn new(
            name: String,
            symbol: String,
            marketplace_treasury: AccountId,
            transaction_fee: u16,
        ) -> Self {
            let mut instance = Self::default();
            instance._init_with_owner(instance.env().caller());
            let collection_id = instance.collection_id();
            instance._set_attribute(collection_id.clone(), String::from("name"), name);
            instance._set_attribute(collection_id.clone(), String::from("symbol"), symbol);
            instance.nft_series.last_token_id = 0;
            instance.nft_series.max_amount = 1;
            instance.nft_series.transaction_fee = transaction_fee;
            instance.nft_series.marketplace_treasury = Some(marketplace_treasury);
            instance
        }

        #[ink(message)]
        #[modifiers(only_owner)]
        pub fn set_code(&mut self, code_hash: [u8; 32]) -> Result<(), PSP34Error> {
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

    impl NFTSeries for NFTContract {
        fn _emit_nft_create_collection(
            &self,
            collection_id: u64,
            creator_address: AccountId,
            title: Option<PreludeString>,
            description: Option<PreludeString>,
            media: Option<PreludeString>,
            cover: Option<PreludeString>,
            twitter: Option<PreludeString>,
            website: Option<PreludeString>,
        ) {
            self.env().emit_event(NFTCreateCollection {
                collection_id,
                creator_address,
                title,
                description,
                media,
                cover,
                twitter,
                website,
            })
        }

        fn _emit_set_series_price(&self, token_series_id: u64, price: Option<Balance>) {
            self.env().emit_event(NFTSetSeriesPrice {
                token_series_id,
                price,
            })
        }

        fn _emit_decrease_series_copies(&self, token_series_id: u64, copies_after: u64) {
            self.env().emit_event(NFTDecreaseSeriesCopies {
                token_series_id,
                copies_after,
            })
        }

        fn _emit_nft_buy(
            &self,
            token_series_id: u64,
            token_id: u64,
            to: AccountId,
            price: Balance,
        ) {
            self.env().emit_event(NFTSeriesBuy {
                token_id,
                token_series_id,
                to,
                price,
            })
        }

        fn _emit_nft_create_series(
            &self,
            token_series_id: u64,
            base_uri: PreludeString,
            price: Option<Balance>,
            copies: u64,
            royalty: Vec<(AccountId, u32)>,
            iterative: bool,
            creator_address: AccountId,
            collection_id: u64,
        ) {
            self.env().emit_event(NFTCreateSeries {
                token_series_id,
                base_uri,
                price,
                copies,
                royalty,
                iterative,
                creator_address,
                collection_id,
            });
        }
    }

    // Override event emission methods
    impl psp34::Internal for NFTContract {
        fn _emit_transfer_event(&self, from: Option<AccountId>, to: Option<AccountId>, id: Id) {
            self.env().emit_event(Transfer { from, to, id });
        }

        fn _emit_approval_event(
            &self,
            from: AccountId,
            to: AccountId,
            id: Option<Id>,
            approved: bool,
        ) {
            self.env().emit_event(Approval {
                from,
                to,
                id,
                approved,
            });
        }
    }

    // ------------------- T E S T -----------------------------------------------------
    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::test::{self};
        const PRICE: Balance = 1000000000000000000;
        const BASE_URI: &str = "ipfs://myIpfsUri/";

        #[ink::test]
        fn init_works() {
            let sh34 = init();
            let collection_id = sh34.collection_id();
            assert_eq!(
                sh34.get_attribute(collection_id.clone(), String::from("name")),
                Some(String::from("NFT"))
            );
            assert_eq!(
                sh34.get_attribute(collection_id.clone(), String::from("symbol")),
                Some(String::from("SH34"))
            );
            assert_eq!(sh34.max_supply(), 0);
        }

        fn init() -> NFTContract {
            let accounts = default_accounts();

            NFTContract::new(String::from("NFT"), String::from("SH34"), accounts.bob, 200)
        }

        #[ink::test]
        fn create_series_works() {
            let mut sh34 = init();
            let accounts = default_accounts();

            set_sender(accounts.alice);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let result = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![],
                true,
            );

            assert!(result.is_ok());

            let token_series_metadata = sh34.get_series(1);
            assert_eq!(token_series_metadata.base_uri, BASE_URI);
            assert_eq!(token_series_metadata.price, None);
            assert_eq!(token_series_metadata.copies, 10000);
            assert_eq!(token_series_metadata.royalty, vec![]);
            assert_eq!(token_series_metadata.iterative, true);
            assert_eq!(token_series_metadata.minted_copies, 0);

            assert_eq!(2, ink::env::test::recorded_events().count());
        }

        #[ink::test]
        fn mint_from_series_works() {
            let mut sh34 = init();
            let accounts = default_accounts();
            assert_eq!(sh34.total_supply(), 0);

            set_sender(accounts.alice);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![],
                true,
            );

            let _ = sh34.nft_mint(1, accounts.alice);
            assert_eq!(sh34.total_supply(), 1);
            assert_eq!(sh34.owner_of(Id::U64(1)), Some(accounts.alice));
            assert_eq!(sh34.balance_of(accounts.alice), 1);
            assert_eq!(
                sh34.owners_token_by_index(accounts.alice, 0),
                Ok(Id::U64(1))
            );

            assert_eq!(sh34.nft_series.last_token_id, 1);
            assert_eq!(3, ink::env::test::recorded_events().count());
        }

        #[ink::test]
        fn token_uri_works() {
            let mut sh34 = init();
            let accounts = default_accounts();

            set_sender(accounts.alice);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![],
                true,
            );
            let _ = sh34.nft_mint(1, accounts.alice);
            let token_uri = sh34.token_uri(1);
            assert_eq!(token_uri, BASE_URI.to_string() + "1.json");

            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![],
                false,
            );
            let _ = sh34.nft_mint(2, accounts.alice);

            let token_uri = sh34.token_uri(2);
            assert_eq!(token_uri, BASE_URI.to_string());
        }

        #[ink::test]
        fn buy_from_series_works() {
            let mut sh34 = init();
            let accounts = default_accounts();

            set_balance(accounts.alice, PRICE * 10);
            set_balance(accounts.bob, PRICE * 10);

            assert_eq!(sh34.total_supply(), 0);

            set_sender(accounts.django);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                Some(PRICE),
                10000,
                vec![],
                true,
            );

            let bob_balance_before = get_balance(accounts.bob);
            let django_balance_before = get_balance(accounts.django);

            set_sender(accounts.charlie);
            test::set_value_transferred::<ink::env::DefaultEnvironment>(PRICE);
            let _ = sh34.nft_buy(1, None);
            assert_eq!(sh34.total_supply(), 1);
            assert_eq!(sh34.owner_of(Id::U64(1)), Some(accounts.charlie));
            assert_eq!(sh34.balance_of(accounts.charlie), 1);
            assert_eq!(
                sh34.owners_token_by_index(accounts.charlie, 0),
                Ok(Id::U64(1))
            );
            assert_eq!(sh34.nft_series.last_token_id, 1);
            assert_eq!(4, ink::env::test::recorded_events().count());

            let bob_balance_after = get_balance(accounts.bob); // marketplace
            let django_balance_after = get_balance(accounts.django); //creator treasury

            assert_eq!(
                bob_balance_after - bob_balance_before,
                (PRICE * 200) / 10000
            );
            assert_eq!(
                django_balance_after - django_balance_before,
                PRICE - ((PRICE * 200) / 10000)
            );
        }

        #[ink::test]
        fn nft_decrease_series_copies_works() {
            let mut sh34 = init();
            let accounts = default_accounts();

            set_sender(accounts.alice);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![],
                true,
            );

            let _ = sh34.nft_decrease_series_copies(1, 200);

            let token_series_metadata = sh34.get_series(1);

            assert_eq!(token_series_metadata.copies, 10000 - 200);
            assert_eq!(3, ink::env::test::recorded_events().count());
        }

        #[ink::test]
        fn nft_set_series_price_works() {
            let mut sh34 = init();
            let accounts = default_accounts();

            set_sender(accounts.alice);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![],
                true,
            );

            let _ = sh34.nft_set_series_price(1, Some(10));

            let token_series_metadata = sh34.get_series(1);

            assert_eq!(token_series_metadata.price, Some(10));
            assert_eq!(3, ink::env::test::recorded_events().count());
        }

        #[ink::test]
        fn nft_royalty_info_works() {
            let mut sh34 = init();
            let accounts = default_accounts();

            set_sender(accounts.alice);
            let collection_id = sh34
                .nft_create_collection(None, None, None, None, None, None)
                .unwrap();
            let _ = sh34.nft_create_series(
                collection_id,
                BASE_URI.to_string(),
                None,
                10000,
                vec![
                    (accounts.alice, 100),
                    (accounts.bob, 200),
                    (accounts.charlie, 300),
                ],
                true,
            );
            let token_id = sh34.nft_mint(1, accounts.alice).unwrap();

            let price = 10u128.pow(18);

            let royalty_info_result = sh34.royalty_info(token_id, price).unwrap();

            for royalty_item in royalty_info_result {
                if royalty_item.0 == accounts.alice {
                    assert_eq!(royalty_item.1, price * 100 / 10000);
                } else if royalty_item.0 == accounts.bob {
                    assert_eq!(royalty_item.1, price * 200 / 10000);
                } else {
                    assert_eq!(royalty_item.1, price * 300 / 10000);
                }
            }
        }

        #[ink::test]
        fn owner_is_set() {
            let accounts = default_accounts();
            let sh34 = init();
            assert_eq!(sh34.owner(), accounts.alice);
        }

        fn default_accounts() -> test::DefaultAccounts<ink::env::DefaultEnvironment> {
            test::default_accounts::<Environment>()
        }

        fn set_sender(sender: AccountId) {
            ink::env::test::set_caller::<Environment>(sender);
        }

        fn set_balance(account_id: AccountId, balance: Balance) {
            ink::env::test::set_account_balance::<ink::env::DefaultEnvironment>(account_id, balance)
        }

        fn get_balance(account_id: AccountId) -> u128 {
            ink::env::test::get_account_balance::<ink::env::DefaultEnvironment>(account_id).unwrap()
        }
    }
}
