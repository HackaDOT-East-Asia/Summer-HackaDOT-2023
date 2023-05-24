#![cfg_attr(not(feature = "std"), no_std)]

#[ink::contract]
mod income_token {
    use ink::storage::Mapping;
    use trait_erc20::BaseErc20;

    #[ink(storage)]
    pub struct IncomeToken {
        /// Total token supply.
        total_supply: Balance,
        /// Mapping from owner to number of owned token.
        balances: Mapping<AccountId, Balance>,
        /// Mapping of the token amount which an account is allowed to withdraw
        /// from another account.
        allowances: Mapping<(AccountId, AccountId), Balance>,
        // Contract Owner
		mintor: AccountId,
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

    impl IncomeToken {

        #[ink(constructor)]
        pub fn new(total_supply: Balance) -> Self {
            let mut balances = Mapping::default();
            let caller = Self::env().caller();
            balances.insert(caller, &total_supply);
            Self::env().emit_event(Transfer {
                from: None,
                to: Some(caller),
                value: total_supply,
            });
            Self {
                total_supply,
                balances,
                allowances: Default::default(),
                mintor: caller,
            }
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

			Ok(())
		}
    }

    impl BaseErc20 for IncomeToken {
        /// Returns the total token supply.
        #[ink(message)]
        fn total_supply(&self) -> Balance {
            self.total_supply
        }

        /// Returns the account balance for the specified `owner`.
        ///
        /// Returns `0` if the account is non-existent.
        #[ink(message)]
        fn balance_of(&self, owner: AccountId) -> Balance {
            self.balance_of_impl(&owner)
        }
        
        /// Returns the amount which `spender` is still allowed to withdraw from `owner`.
        ///
        /// Returns `0` if no allowance has been set.
        #[ink(message)]
        fn allowance(&self, owner: AccountId, spender: AccountId) -> Balance {
            self.allowance_impl(&owner, &spender)
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
        fn transfer(&mut self, to: AccountId, value: Balance) -> Result<(), Error> {
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
        fn approve(&mut self, spender: AccountId, value: Balance) -> Result<(), Error> {
            let owner = self.env().caller();
            self.allowances.insert((&owner, &spender), &value);
            self.env().emit_event(Approval {
                owner,
                spender,
                value,
            });
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
        fn transfer_from(
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
            self.allowances
                .insert((&from, &caller), &(allowance - value));
            Ok(())
        }
    }

    #[ink(impl)]
    impl IncomeToken {
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
            self.env().emit_event(Transfer {
                from: Some(*from),
                to: Some(*to),
                value,
            });
            Ok(())
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
            let income_token = IncomeToken::default();
            assert_eq!(income_token.get(), false);
        }

        /// We test a simple use case of our contract.
        #[ink::test]
        fn it_works() {
            let mut income_token = IncomeToken::new(false);
            assert_eq!(income_token.get(), false);
            income_token.flip();
            assert_eq!(income_token.get(), true);
        }
    }
}