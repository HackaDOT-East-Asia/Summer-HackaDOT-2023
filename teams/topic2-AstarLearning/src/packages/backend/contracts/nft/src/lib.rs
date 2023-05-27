#![cfg_attr(not(feature = "std"), no_std)]
#![feature(min_specialization)]

/**
 * nft コントラクト 
 */   
#[openbrush::contract]
pub mod nft {
	use ink::storage::Mapping;
	use ink::prelude::string::{
		String as PreludeString,
	};
    // imports from openbrush
	use openbrush::traits::String;
	use openbrush::traits::Storage;
	use openbrush::modifiers;
	use openbrush::contracts::ownable::*;
	use openbrush::contracts::psp34::extensions::mintable::*;
	use openbrush::contracts::psp34::extensions::enumerable::*;
	use openbrush::contracts::psp34::extensions::metadata::*;

	use ink::codegen::{
		EmitEvent,
		Env,
	};

	/**
	 * コントラクトで扱う構造体
	 */
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct NFT {
    	#[storage_field]
		psp34: psp34::Data<Balances>,
		#[storage_field]
		ownable: ownable::Data,
		#[storage_field]
		metadata: metadata::Data,
		last_token_id: u64,
		max_supply: u64,
		own_nfts: Mapping<AccountId, u64>,
    }

	// トランスファーした時のイベント
	#[ink(event)]
	pub struct Transfer {
		#[ink(topic)]
		from: Option<AccountId>,
		#[ink(topic)]
		to: Option<AccountId>,
		#[ink(topic)]
		id: Id,
	}
 
	// approveした時のイベント
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
    
    impl NFT {
		/**
		 * new メソッド
		 */
        #[ink(constructor, payable)]
        pub fn new(
            nft_name: PreludeString,
            nft_symbol: PreludeString,
			nft_description: PreludeString,
            nft_image_uri :PreludeString,
		) -> Self {
            let mut _instance = Self::default();
			_instance._init_with_owner(_instance.env().caller());
			//  _instance._mint_to(_instance.env().caller(), Id::U8(1)).expect("Can mint");
			// get colleciton id
			let collection_id = _instance.collection_id();
			// set name & symbol attribute
			let res = _instance.set_nft_name(nft_name);
			let res2 = _instance.set_nft_symbol(nft_symbol);
			let res3 = _instance.set_nft_description(nft_description);
			let res4 = _instance.set_nft_iamge(nft_image_uri);

			//std::println!("set NFT Name Result: {:?}", res);
			//std::println!("set NFT Symbol Result: {:?}", res2);
			//std::println!("set NFT Description Result: {:?}", res3);
			//std::println!("set NFT Image Result: {:?}", res4);

			// set max supply last_token_id own_nfts
			_instance.max_supply = 100_000_000_000_000_000;
			_instance.last_token_id = 0;
			_instance.own_nfts = Mapping::default();
			
			_instance 
        }

		/**
		 * mint_nft function
		 */
		#[ink(message, payable)]
		pub fn mint_nft(&mut self) -> Result<(), PSP34Error> {
			// token id of mint 
			let mint_id = self.last_token_id;
			// call _mint_to function
			self._mint_to(Self::env().caller(), Id::U64(mint_id));
			// mappingに登録する。
			self.own_nfts.insert(Self::env().caller(), &mint_id);

			// インクリメント
			self.last_token_id += 1;
			Ok(())
		}
		
		/**
		 * set_base_uri function
		 */
		#[ink(message)]
		#[modifiers(only_owner)]
		pub fn set_base_uri(&mut self, uri: PreludeString) -> Result<(), PSP34Error> {
			let id = self.collection_id();
			self._set_attribute(id, String::from("baseUri"), uri.into_bytes());
			Ok(())
		}

		/**
		 * set_nft_name functin
		 */
		#[ink(message)]
		#[modifiers(only_owner)]
		pub fn set_nft_name(&mut self, name: PreludeString) -> Result<(), PSP34Error> {
			let id = self.collection_id();
			self._set_attribute(id, String::from("name"), name.into_bytes());
			Ok(())
		}

		/**
		 * set_nft_symbol function
		 */
		#[ink(message)]
	 	#[modifiers(only_owner)]
		pub fn set_nft_symbol(&mut self, symbol: PreludeString) -> Result<(), PSP34Error> {
			let id = self.collection_id();
			self._set_attribute(id, String::from("symbol"), symbol.into_bytes());
			Ok(())
		}

		/**
		 * set_nft_image function
		 */
		#[ink(message)]
	 	#[modifiers(only_owner)]
		pub fn set_nft_iamge(&mut self, image: PreludeString) -> Result<(), PSP34Error> {
			let id = self.collection_id();
			self._set_attribute(id, String::from("image"), image.into_bytes());
			Ok(())
		}

		/**
		 * set_nft_description function
		 */
		#[ink(message)]
	 	#[modifiers(only_owner)]
		pub fn set_nft_description(&mut self, description: PreludeString) -> Result<(), PSP34Error> {
			let id = self.collection_id();
			self._set_attribute(id, String::from("description"), description.into_bytes());
			Ok(())
		}

		/**
		 * token_uri fucntion
		 */
		#[ink(message)]
		pub fn token_uri(&self, token_id: u64) -> Result<PreludeString, PSP34Error> {
			self.token_exists(Id::U64(token_id))?;
			// get attrivute
			let value = self.get_attribute(self.collection_id(),String::from("baseUri"),);
			let token_uri = PreludeString::from_utf8(value.unwrap()).unwrap();
			Ok(token_uri)
		}
		
		/**
		 * withdraw funciotn
		 */
		#[ink(message)]
		#[modifiers(only_owner)]
		pub fn withdraw(&mut self) -> Result<(), PSP34Error> {
			let balance = Self::env().balance();
			let current_balance = balance
				.checked_sub(Self::env().minimum_balance())
				.unwrap_or_default();
	
			Self::env()
				.transfer(self.owner(), current_balance)
				.map_err(|_| {
					PSP34Error::Custom(String::from("WithdrawalFailed"))
				})?;
			Ok(())
		}
		
		/**
		 * max_supply function 
		 */
		#[ink(message)]
		pub fn max_supply(&self) -> u64 {
			self.max_supply
		}
	
		/**
		 * check_amount function
		 */
		#[ink(message)]
		pub fn check_amount(&self, mint_amount: u64) -> Result<(), PSP34Error> {
			if mint_amount == 0 {
				return Err(PSP34Error::Custom(String::from("CannotMintZeroTokens")))
			}
			if let Some(amount) = self.last_token_id.checked_add(mint_amount) {
				if amount <= self.max_supply {
					return Ok(())
				}
			}
			return Err(PSP34Error::Custom(String::from("CollectionIsFull")))
		}
	
		/**
		 * token_exitsts function
		 */
		#[ink(message)]
		pub fn token_exists(&self, id: Id) -> Result<(), PSP34Error> {
			self.owner_of(id).ok_or(PSP34Error::TokenNotExists)?;
			Ok(())
		}

		/**
		 * get_nft_name function
		 */
		#[ink(message)]
		pub fn get_nft_name(&self) -> Result<PreludeString, PSP34Error> {
			// get attrivute
			let value = self.get_attribute(self.collection_id(),String::from("name"),);
			let name = PreludeString::from_utf8(value.unwrap()).unwrap();
			Ok(name)
		}

		/**
		 * get_nft_symbol function
		 */
		#[ink(message)]
		pub fn get_nft_symbol(&self) -> Result<PreludeString, PSP34Error> {
			// get attrivute
			let value = self.get_attribute(self.collection_id(),String::from("symbol"),);
			let symbol = PreludeString::from_utf8(value.unwrap()).unwrap();
			Ok(symbol)
		}

		/**
		 * get_own_nfts function
		 */
		#[ink(message)]
		pub fn get_own_nfts(&self) -> Result<u64, PSP34Error> {
			let res = self.own_nfts.get(Self::env().caller()).unwrap();
			Ok(res)
		}

		/**
		 * get_nft_image function
		 */
		#[ink(message)]
		pub fn get_iamge(&self) -> Result<PreludeString, PSP34Error> {
			let value = Some(self.get_attribute(self.collection_id(),String::from("image"),));
			let image = PreludeString::from_utf8(value.unwrap().unwrap()).unwrap();
			Ok(image)
		}

		/**
		 * get_nft_description function
		 */
		#[ink(message)]
		pub fn get_nft_description(&self) -> Result<PreludeString, PSP34Error> {
			let value = Some(self.get_attribute(self.collection_id(),String::from("description"),));
			let description = PreludeString::from_utf8(value.unwrap().unwrap()).unwrap();
			Ok(description)
		}		
    }

	// ---------------------------------- test ---------------------------------- 
	#[cfg(test)]
    mod tests {
        use super::*;
        use crate::nft::PSP34Error::*;
        use ink::env::test;
		use ink::prelude::string::{
			String as PreludeString,
		};
		use openbrush::traits::String;

		const NFT_NAME: &str = "Learn WASM NFT";
		const NFT_SYMBOL: &str = "WTF";
		const NFT_BASE_URI: &str = "https://bafybeib5ixaris66ajoickapsv35fqqzkihaqkygukanrg3ibzcw6z65qq.ipfs.nftstorage.link/";
		const NFT_DESCRIPTION: &str = "WASMの学習コンテンツをクリアした証です。";

        const PRICE: Balance = 100_000_000_000_000_000;
		const BASE_URI: &str = "https://gateway.pinata.cloud/ipfs/QmdwZBwsEKNpc9uUgUzsgiGb2uYM9X1aca9Ezgz1pR79Jo/";
		const MAX_SUPPLY: u64 = 100_000_000_000_000_000;
		
		/**
		 * 初期化メソッド
		 */
        fn init() -> NFT {
            let nft = NFT::new(
				NFT_NAME.to_string(),
				NFT_SYMBOL.to_string(),
				NFT_BASE_URI.to_string(),
				NFT_DESCRIPTION.to_string()
			);
			nft
        }

		/**
		 * set sender method
		 */
		fn set_sender(sender: AccountId) {
            ink::env::test::set_caller::<Environment>(sender);
        }

		/**
		 * 初期値をテストするコード
		 */
		#[ink::test]
		fn default_works() {
			let mut sh34 = init();
			// 名前などの情報をチェックする
			assert_eq!(sh34.total_supply(), 0);
			assert_eq!(sh34.max_supply(), MAX_SUPPLY);

			//assert_eq!(sh34.get_nft_name()?, String::from("WasmNFT"));
			//assert_eq!(sh34.get_nft_symbol()?.get(0), String::from("WFT"));
		}

		/**
		 * NFTを一つミントするテストコード
		 */
        #[ink::test]
        fn mint_single_works() {
            let mut sh34 = init();
            let accounts = test::default_accounts::<Environment>();
			// 送信元アドレスを設定する。
            set_sender(accounts.bob);
            let num_of_mints: u64 = 1;

            assert_eq!(sh34.total_supply(), 0);

            test::set_value_transferred::<ink::env::DefaultEnvironment>(
                PRICE * num_of_mints as u128,
            );

            assert!(sh34.mint_nft().is_ok());
            assert_eq!(sh34.total_supply(), num_of_mints as u128);
            assert_eq!(sh34.balance_of(accounts.bob), 1);
            assert_eq!(sh34.owners_token_by_index(accounts.bob, 0), Ok(Id::U64(0)));
			assert_eq!(1, ink::env::test::recorded_events().count());
            assert_eq!(
                sh34.owners_token_by_index(accounts.bob, 5),
                Err(TokenNotExists)
            );
        }

		/**
		 * NFTを2つミントするテストコード
		 */
		#[ink::test]
        fn mint_multiple_works() {
			let mut sh34 = init();
            let accounts = test::default_accounts::<Environment>();
			// 送信元アドレスを設定する。
            set_sender(accounts.bob);
            let num_of_mints: u64 = 2;

            assert_eq!(sh34.total_supply(), 0);

            test::set_value_transferred::<ink::env::DefaultEnvironment>(
                PRICE * num_of_mints as u128,
            );

            assert!(sh34.mint_nft().is_ok());
			assert!(sh34.mint_nft().is_ok());
            assert_eq!(sh34.total_supply(), num_of_mints as u128);
            assert_eq!(sh34.balance_of(accounts.bob), 2);
            assert_eq!(sh34.owners_token_by_index(accounts.bob, 0), Ok(Id::U64(0)));
			assert_eq!(sh34.owners_token_by_index(accounts.bob, 1), Ok(Id::U64(1)));
			assert_eq!(2, ink::env::test::recorded_events().count());
            assert_eq!(
                sh34.owners_token_by_index(accounts.bob, 5),
                Err(TokenNotExists)
            );
		}
	}
}