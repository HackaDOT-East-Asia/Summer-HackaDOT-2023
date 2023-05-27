#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod security_token {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;

    #[derive(scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(scale_info::TypeInfo, ink::storage::traits::StorageLayout)
    )]
    pub struct Income {
        start_block: BlockNumber,
        end_block: BlockNumber,
        amount_per_block: Balance,
        total_supply: Balance,
    }

    /// Trait implemented by all ERC-20 respecting smart contracts.
    #[ink::trait_definition]
    pub trait BaseErc20 {
        /// Returns the total token supply.
        #[ink(message)]
        fn total_supply(&self) -> Balance;

        /// Returns the account balance for the specified `owner`.
        #[ink(message)]
        fn balance_of(&self, owner: AccountId) -> Balance;

        /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
        #[ink(message)]
        fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance;

        /// Transfers `value` amount of tokens from the caller's account to account `to`.
        #[ink(message)]
        fn transfer(&mut self, to: AccountId, value: Balance) -> Result<(), Error>;

        /// Allows `spender` to withdraw from the caller's account multiple times, up to
        /// the `value` amount.
        #[ink(message)]
        fn approve(&mut self, spender: AccountId, value: Balance) -> Result<(), Error>;

        /// Transfers `value` tokens on the behalf of `from` to the account `to`.
        #[ink(message)]
        fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: Balance,
        ) -> Result<(), Error>;
    }

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct SecurityToken {
        /// Total token supply.
        total_supply: Balance,
        /// Mapping from owner to number of owned token.
        balances: Mapping<AccountId, Balance>,
        /// Mapping of the token amount which an account is allowed to withdraw
        /// from another account.
        allowances: Mapping<(AccountId, AccountId), Balance>,
        // Holder, block height => balance
        balance_snapshot: Mapping<(AccountId, BlockNumber), Balance>,
        // holder => changed balance record array
        balance_changed_record: Mapping<AccountId, Vec<BlockNumber>>,
        // Income token => income array
        incomes: Mapping<AccountId, Vec<Income>>,
        // income token, Holder => block height
        withdrawn_income_offset: Mapping<(AccountId, AccountId), BlockNumber>,
        // Contract Owner
		mintor: AccountId,
    }

	/// Event emitted when a token transfer occurs.
	#[ink(event)]
	pub struct Transfer {
		#[ink(topic)]
		from: Option<AccountId>,
		#[ink(topic)]
		to: Option<AccountId>,
		value: Balance,
	}

	/// Event emitted when an approval occurs that `spender` is allowed to withdraw
	/// up to the amount of `value` tokens from `owner`.
	#[ink(event)]
	pub struct Approval {
		#[ink(topic)]
		owner: AccountId,
		#[ink(topic)]
		spender: AccountId,
		value: Balance,
	}

	#[ink(event)]
	pub struct Mint {
		#[ink(topic)]
		to: AccountId,
		value: Balance,
	}

	#[ink(event)]
	pub struct Burn {
		#[ink(topic)]
		from: AccountId,
		value: Balance,
	}

	/// The ERC-20 error types.
	#[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
	#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
	pub enum Error {
		/// Returned if not enough balance to fulfill a request is available.
		InsufficientBalance,
		/// Returned if not enough allowance to fulfill a request is available.
		InsufficientAllowance,
        /// Returned if not code owner.
		Unauthorized,
        /// Invalied block range
        InvalidBlockRanage,
        /// Not enough allowed income token amount
        NotEnoughIncomeToken,
	}


    impl SecurityToken {
        /// Creates a new ERC-20 contract with the specified initial supply.
        #[ink(constructor)]
        pub fn new(total_supply: Balance, subscribers: Vec<AccountId>, subscription_amounts: Vec<Balance>) -> Self {
            let caller = Self::env().caller();
            let mut total_subscription_amount: Balance = 0;

            if subscribers.len() !=  subscription_amounts.len() {
                panic!("Subscribers and subscription_amounts should be the same length")
            }

            let mut this: SecurityToken = Self {
                total_supply,
                balances: Mapping::default(),
                allowances: Mapping::default(),
                balance_snapshot: Mapping::default(),
                balance_changed_record: Mapping::default(),
                incomes: Mapping::default(),
                withdrawn_income_offset: Mapping::default(),
                mintor: caller,
            };

            if subscribers.len() > 0 {
                for _amount in subscription_amounts.iter() {
                    total_subscription_amount += _amount;
                }
                
                if total_subscription_amount == 0 {
                    panic!("Total subscription amount should be greater than 0.")
                }

                for (_index, _subscriber) in subscribers.iter().enumerate() {
                    let amount = subscription_amounts[_index];
                    let supply = amount * total_supply / total_subscription_amount;
                    ink::env::debug_println!("supply:{}", supply);
                    this.balances.insert(&_subscriber, &supply);
        
                    this.env().emit_event(Mint { to: *_subscriber, value: supply });
                    this.env().emit_event(Transfer { from: None, to: Some(*_subscriber), value: supply });
    
                    this.balance_snapshot(_subscriber);
                }
            }

            return this;
        }

        /// Returns the total token supply.
        #[ink(message)]
        pub fn total_supply(&self) -> Balance {
            self.total_supply
        }

        /// Returns the account balance for the specified `owner`.
        ///
        /// Returns `0` if the account is non-existent.
        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> Balance {
            self.balance_of_impl(&owner)
        }

        /// Returns the account balance for the specified `owner`.
        ///
        /// Returns `0` if the account is non-existent.
        ///
        /// # Note
        ///
        /// Prefer to call this method over `balance_of` since this
        /// works using references which are more efficient in Wasm.
        #[inline]
        fn balance_of_impl(&self, owner: &AccountId) -> Balance {
            self.balances.get(owner).unwrap_or_default()
        }

        /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
        ///
        /// Returns `0` if no allowance has been set.
        #[ink(message)]
        pub fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowance_impl(&owner, &spender)
        }

        /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
        ///
        /// Returns `0` if no allowance has been set.
        ///
        /// # Note
        ///
        /// Prefer to call this method over `allowance` since this
        /// works using references which are more efficient in Wasm.
        #[inline]
        fn allowance_impl(&self, owner: &AccountId, spender: &AccountId) -> Balance {
            self.allowances.get((owner, spender)).unwrap_or_default()
        }

        /// Transfers `value` amount of tokens from the caller's account to account `to`.
        ///
        /// On success a `Transfer` event is emitted.
        ///
        /// # Errors
        ///
        /// Returns `InsufficientBalance` error if there are not enough tokens on
        /// the caller's account balance.
        #[ink(message)]
        pub fn transfer(&mut self, to: AccountId, value: Balance) -> Result<(), Error> {
            let from = self.env().caller();
            self.transfer_from_to(&from, &to, value)
        }

        /// Allows `spender` to withdraw from the caller's account multiple times, up to
        /// the `value` amount.
        ///
        /// If this function is called again it overwrites the current allowance with
        /// `value`.
        ///
        /// An `Approval` event is emitted.
        #[ink(message)]
        pub fn approve(&mut self, spender: AccountId, value: Balance) -> Result<(), Error> {
            let owner = self.env().caller();
            self.allowances.insert((&owner, &spender), &value);

            self.env().emit_event(Approval { owner, spender, value });

            Ok(())
        }

        /// Transfers `value` tokens on the behalf of `from` to the account `to`.
        ///
        /// This can be used to allow a contract to transfer tokens on ones behalf and/or
        /// to charge fees in sub-currencies, for example.
        ///
        /// On success a `Transfer` event is emitted.
        ///
        /// # Errors
        ///
        /// Returns `InsufficientAllowance` error if there are not enough tokens allowed
        /// for the caller to withdraw from `from`.
        ///
        /// Returns `InsufficientBalance` error if there are not enough tokens on
        /// the account balance of `from`.
        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            value: Balance,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            let allowance = self.allowance_impl(&from, &caller);

            if allowance < value {
                return Err(Error::InsufficientAllowance)
            }

            self.transfer_from_to(&from, &to, value)?;
            self.allowances.insert((&from, &caller), &(allowance - value));

            Ok(())
        }

        /// Transfers `value` amount of tokens from the caller's account to account `to`.
        ///
        /// On success a `Transfer` event is emitted.
        ///
        /// # Errors
        ///
        /// Returns `InsufficientBalance` error if there are not enough tokens on
        /// the caller's account balance.
        fn transfer_from_to(
            &mut self,
            from: &AccountId,
            to: &AccountId,
            value: Balance,
        ) -> Result<(), Error> {
            let from_balance = self.balance_of_impl(from);

            if from_balance < value {
                return Err(Error::InsufficientBalance)
            }

            self.balances.insert(from, &(from_balance - value));

            let to_balance = self.balance_of_impl(to);
            self.balances.insert(to, &(to_balance + value));

            self.env().emit_event(Transfer { from: Some(*from), to: Some(*to), value});

            self.balance_snapshot(from);
            self.balance_snapshot(to);

            Ok(())
        }

        #[ink(message)]
		pub fn mint(
			&mut self,
			to: AccountId,
			value: Balance,
		) -> Result<(), Error> {
			let from = self.env().caller();

			if self.mintor != from {
				return Err(Error::Unauthorized);
			}

			self.mint_impl(&to, value);

			Ok(())
		}

		fn mint_impl(&mut self, to: &AccountId, value: Balance) {
			self.total_supply = self.total_supply + value;

			let to_balance = self.balance_of_impl(to);
			self.balances.insert(to, &(to_balance + value));

			self.env().emit_event(Mint { to: *to, value, });
			self.env().emit_event(Transfer { from: None, to: Some(*to), value, });

            self.balance_snapshot(to);
		}

        #[ink(message)]
        pub fn burn(
			&mut self,
			value: Balance,
		) -> Result<(), Error> {
			let from = self.env().caller();
            let from_balance = self.balance_of_impl(&from);
            
            if from_balance < value{
                return Err(Error::InsufficientBalance)
            }

            self.balances.insert(&from, &(from_balance - value));
            self.total_supply = self.total_supply - value;

            self.env().emit_event(Burn { from: from, value });
			self.env().emit_event(Transfer { from: Some(from), to: None, value });

            self.balance_snapshot(&from);

			Ok(())
		}

        fn balance_snapshot(&mut self, holder: &AccountId) {
            let block_number:BlockNumber = self.env().block_number();
            let balance = self.balance_of_impl(holder);

            self.balance_snapshot.insert((holder, block_number), &balance);

            if let Some(mut records) = self.balance_changed_record.get(holder) {
                records.push(block_number);
                self.balance_changed_record.insert(holder, &records);   
            } else {
                let mut records = Vec::new();
                records.push(block_number);
                
                self.balance_changed_record.insert(holder, &records);
            }       
        }

        #[ink(message)]
        pub fn deposit_income(
            &mut self,
            token: AccountId,
            amount: Balance,
            start_block: BlockNumber,
            end_block: BlockNumber,
            total_supply: Balance,
        ) -> Result<(), Error> {
            if end_block <= start_block {
                return Err(Error::InvalidBlockRanage)
            }

            let from = self.env().caller();
            let this_contract = self.env().account_id();
            let mut base_erc20: ink::contract_ref!(BaseErc20) = token.into();

            if base_erc20.allowance(from, this_contract) < amount {
                return Err(Error::NotEnoughIncomeToken);
            }
            
            if let Err(err) = base_erc20.transfer_from(from, this_contract, amount) {
                return Err(err);
            }

            let income = Income { 
                start_block, 
                end_block, 
                amount_per_block: amount / u128::try_from(end_block - start_block + 1).unwrap(), 
                total_supply,
            };
            ink::env::debug_println!("amount_per_block:{}", income.amount_per_block);
            if let Some(mut account_incomes) = self.incomes.get(token) {
                account_incomes.push(income);
                self.incomes.insert(&token, &account_incomes);
            } else {
                let mut incomes = Vec::new();
                incomes.push(income);

                self.incomes.insert(&token, &incomes);
            }
            
            Ok(())
        }

        #[ink(message)]
        pub fn withdraw_income(
            &mut self,
            token: AccountId,
        ) -> Result<(), Error> {
            let from = self.env().caller();
            let block_number = self.env().block_number();
            let incomes = self.incomes.get(&token).unwrap_or_default();
            let last_withdraw_offset  = self.withdrawn_income_offset.get((&token, &from)).unwrap_or_default();
            let records = self.balance_changed_record.get(&from).unwrap_or_default();
            let records_len = records.len();
            let mut total_dividend_income = 0;

            ink::env::debug_println!("records.len:{}", records_len);
            ink::env::debug_println!("incomes.len:{}", incomes.len());
            ink::env::debug_println!("last_withdraw_offset:{}", last_withdraw_offset);
            for _income in incomes.iter().skip(usize::try_from(last_withdraw_offset).unwrap()) {
                for (_index, _record) in records.iter().enumerate() {
                    let _start_block = *records.get(_index).unwrap();
                    let _end_block = if _index + 1 == records_len { block_number } else { *records.get(_index + 1).unwrap() - 1 };
                    ink::env::debug_println!("_start_block:{}, _end_block:{}", _start_block, _end_block);
                    ink::env::debug_println!("_income.end_block :{}, _income.start_block:{}", _income.start_block , _income.end_block);
                    if _start_block > _income.end_block || _end_block < _income.start_block {
                        continue;
                    }
                    
                    let start_block = if _start_block < _income.start_block { _income.start_block } else { _start_block };
                    let end_block = if _end_block > _income.end_block { _income.end_block } else { _end_block };
                    ink::env::debug_println!("start_block:{}, end_block:{}", start_block, end_block);
                    if let Some(snapshot_balance) = self.balance_snapshot.get((&from, &_start_block)) {
                        ink::env::debug_println!("snapshot_balance:{}", snapshot_balance);
                        ink::env::debug_println!("amount_per_block:{}", _income.amount_per_block);
                        ink::env::debug_println!("total_supply:{}", _income.total_supply);
                        ink::env::debug_println!("calc:{}", snapshot_balance * &_income.amount_per_block * ((end_block - start_block + 1) as u128) / &_income.total_supply);
                        total_dividend_income += snapshot_balance * &_income.amount_per_block * ((end_block - start_block + 1) as u128) / &_income.total_supply;
                    }
                }

            }

            ink::env::debug_println!("total_dividend_income:{}", total_dividend_income);

            let mut base_erc20: ink::contract_ref!(BaseErc20) = token.into();
            if let Err(err) = base_erc20.transfer(from, total_dividend_income) {
                return Err(err);
            }
            
            let new_last_withdraw_offset:BlockNumber = u32::try_from(incomes.len() - 1).unwrap();

            self.withdrawn_income_offset.insert((&token, &from), &new_last_withdraw_offset);
            
            Ok(())
        }
    }
}
