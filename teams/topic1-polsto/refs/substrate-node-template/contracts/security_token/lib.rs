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
        // Holder => block height => blance
        balance_snapshot: Mapping<AccountId,(BlockNumber, Balance)>,
        // holder => changed balance record array
        balance_changed_record: Mapping<AccountId, Vec<BlockNumber>>,
        // Income token => income array
        incomes: Mapping<AccountId, Vec<Income>>,
        // income token => 
        withdrawn_income_offset: Mapping<AccountId, (AccountId, Balance)>,
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
	pub struct Brun {
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

            for _amount in subscription_amounts.iter() {
                total_subscription_amount += _amount;
            }

            if total_subscription_amount > total_supply {
                panic!("Subscription amount should be less than total supply")
            }

            let mut this = Self {
                total_supply,
                balances: Mapping::default(),
                allowances: Mapping::default(),
                balance_snapshot: Mapping::default(),
                balance_changed_record: Mapping::default(),
                incomes: Mapping::default(),
                withdrawn_income_offset: Mapping::default(),
                mintor: caller,
            };
            
            for (_index, _subscriber) in subscribers.iter().enumerate() {
                let amount = subscription_amounts[_index];
                let supply = amount * total_supply / total_subscription_amount;

                this.balances.insert(_subscriber, &supply);
    
                this.env().emit_event(Mint { to: *_subscriber, value: supply });
                this.env().emit_event(Transfer { from: None, to: Some(*_subscriber), value: supply });
            }

            this.balances.insert(caller, &(total_supply - total_subscription_amount));

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

            self.balances.insert(from, &(from_balance - value));
            self.total_supply = self.total_supply - value;

            self.env().emit_event(Brun { from: from, value, });
			self.env().emit_event(Transfer { from: Some(from), to: None, value, });

            self.balance_snapshot(&from);

			Ok(())
		}

        #[allow(unused)]
        fn balance_snapshot(&mut self, holder: &AccountId) {
            let block_number:BlockNumber = self.env().block_number();
            let balance = self.balance_of_impl(&holder);

            self.balance_snapshot.insert(holder, &(block_number, balance));

            let some = self.balance_changed_record.get(holder);

            if let Some(mut records) = self.balance_changed_record.get(holder) {
                records.push(block_number);
            } else {
                let mut records = Vec::new();
                records.push(block_number);

                self.balance_changed_record.insert(holder, &records);
            }       
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
            let security_token = SecurityToken::default();
            assert_eq!(security_token.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut security_token = SecurityToken::new(false);
            assert_eq!(security_token.get(), false);
            security_token.flip();
            assert_eq!(security_token.get(), true);
        }
    }
}
