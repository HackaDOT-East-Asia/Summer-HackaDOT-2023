#![cfg_attr(not(feature = "std"), no_std, no_main)]

#[ink::contract]
mod rps {
    use ink::env::Error as EnvError;

    use ink::prelude::string::String;
    use ink::prelude::vec::Vec;
    use ink::env::hash::Blake2x256;
    use ink::env::hash::CryptoHash;
    use ink::storage::Mapping;

    /// A token ID.
    pub type TokenId = u32;

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum Error {
        CallRuntimeFailed,
        NotOwner,
        NotApproved,
        TokenExists,
        TokenNotFound,
        CannotInsert,
        CannotFetchValue,
        NotAllowed,
        TransferFailed,
        InvalidStatus,
        BurnFailed,
        InvalidValue,
    }

    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum RuntimeError {
        CallRuntimeFailed,
    }

    impl From<EnvError> for RuntimeError {
        fn from(e: EnvError) -> Self {
            match e {
                EnvError::CallRuntimeFailed => RuntimeError::CallRuntimeFailed,
                _ => panic!("Unexpected error from `pallet-contracts`."),
            }
        }
    }

    #[derive(Debug, PartialEq, Eq, Clone, Copy, scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo)
    )]
    pub enum GameStatus {
        /// An game has not started yet.
        NotStarted,
        /// An game round is currently running.
        RoundStarted,
        /// An game round is currently halted for verification.
        RoundHalted,
        /// An game round has ended.
        RoundEnded,
        /// An game round has ended and is currently halted for vote
        GameVote,
        /// An game has ended.
        GameEnded,
    }

    #[derive(Debug, PartialEq, Eq, Clone, scale::Decode, scale::Encode)]
    #[cfg_attr(
        feature = "std",
        derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo)
    )]
    pub struct GameMember {
        token_id: u32,
        owner: AccountId,
        life: u8,
        rps_move: u8,
        salted_hash: [u8; 32],

        last_moved_at: u32,

        last_voted_at: u32,

        is_rewarded: bool,
    }

    /// Defines the storage of your contract.
    /// Add new fields to the below struct in order
    /// to add new static storage fields to your contract.
    #[ink(storage)]
    pub struct Rps {
        /// Entry array
        joined: Vec<GameMember>,
        readied: Vec<u16>,
        matched: Vec<u16>,
        starting_member_cnt: u16,
        game_end_member_cnt: u16,
        vote_per_round: u8,
        game_status: GameStatus,

        current_round_no: u32,
        // moved member control
        required_moved_member_cnt: u16,
        current_moved_member_cnt: u16,
        max_life: u8,
        // vote control
        current_vote_cnt: u16,

        // time control
        phase_ended_at: u64,
        move_time_limit: u64,
        reveal_time_limit: u64,
        vote_time_limit: u64,

        // allocated value
        allocated_value: Balance,
        mint_cost: Balance,

        /// Mapping from token to owner.
        token_owner: Mapping<TokenId, AccountId>,
        /// Mapping from token to approvals users.
        token_approvals: Mapping<TokenId, AccountId>,
        /// Mapping from owner to number of owned token.
        owned_tokens_count: Mapping<AccountId, u32>,
        /// Mapping from owner to operator approvals.
        operator_approvals: Mapping<(AccountId, AccountId), ()>,
        /// Mapping for token metadata. TODO: separate metadata structure and approval from token data.
        token_metadata: Mapping<TokenId, String>,
    }

    /// Event emitted when a token transfer occurs.
    #[ink(event)]
    pub struct Transfer {
        #[ink(topic)]
        from: Option<AccountId>,
        #[ink(topic)]
        to: Option<AccountId>,
        #[ink(topic)]
        id: TokenId,
    }

    /// Event emitted when a token approve occurs.
    #[ink(event)]
    pub struct Approval {
        #[ink(topic)]
        from: AccountId,
        #[ink(topic)]
        to: AccountId,
        #[ink(topic)]
        id: TokenId,
    }

    /// Event emitted when an operator is enabled or disabled for an owner.
    /// The operator can manage all NFTs of the owner.
    #[ink(event)]
    pub struct ApprovalForAll {
        #[ink(topic)]
        owner: AccountId,
        #[ink(topic)]
        operator: AccountId,
        approved: bool,
    }

    impl Rps {
        /// Constructor that initializes the `bool` value to the given `init_value`.
        #[ink(constructor, payable)]
        pub fn new(starting_member_cnt: u16, game_end_member_cnt: u16, max_life: u8, vote_per_round: u8, mint_cost: Balance) -> Self {
            let initial_deposit = Self::env().transferred_value();
            Self {
                joined: Vec::new(),
                readied: Vec::new(),
                matched: Vec::new(),
                starting_member_cnt: starting_member_cnt,
                game_end_member_cnt: game_end_member_cnt,
                vote_per_round: vote_per_round,
                game_status: GameStatus::NotStarted,
                current_round_no: 0,
                required_moved_member_cnt: 0,
                current_moved_member_cnt: 0,
                max_life: max_life,
                current_vote_cnt: 0,

                phase_ended_at: 0,
                move_time_limit: 1000 * 1,  // set to 1 sec for demo
                reveal_time_limit: 1000 * 1,  // set to 1 sec for demo
                vote_time_limit: 1000 * 1,  // set to 1 sec for demo

                allocated_value: initial_deposit,
                mint_cost: mint_cost,

                token_owner: Default::default(),
                token_approvals: Default::default(),
                owned_tokens_count: Default::default(),
                operator_approvals: Default::default(),
                token_metadata: Default::default(),
            }
        }

        #[ink(message)]
        pub fn get_game_info(&self) -> (u16, u16, u8, GameStatus, u32, u16, u16, u16, u128, u128, u128, Vec<u16>) {
            let contract_balance = self.env().balance();
            (
                self.starting_member_cnt,
                self.game_end_member_cnt,
                self.vote_per_round,
                self.game_status,
                self.current_round_no,
                self.required_moved_member_cnt,
                self.current_moved_member_cnt,
                self.current_vote_cnt,
                contract_balance,
                self.allocated_value,
                self.mint_cost,
                self.matched.clone(),
            )
        }

        #[ink(message)]
        pub fn get_all_members_info(&self) -> Vec<GameMember> {
            self.joined.clone()
        }

        /// A message that can be called from the user to join the game.
        #[ink(message)]
        pub fn join(&mut self, token_id: u32) -> Result<(), Error> {
            // only able to call this when game status is NotStarted
            if self.game_status != GameStatus::NotStarted {
                return Err(Error::InvalidStatus);
            }

            // transfer erc721 to contract
            self.transfer(self.env().account_id(), token_id)?;

            // add own account id to joined array
            let caller = self.env().caller();
            let member = GameMember {
                token_id: token_id,
                owner: caller,
                life: self.max_life,
                rps_move: 0,
                salted_hash: [0; 32],
                last_moved_at: 0,
                last_voted_at: 0,
                is_rewarded: false,
            };
            self.joined.push(member);

            // check if enough players joined
            // if yes, start round
            if self.joined.len() == self.starting_member_cnt as usize {
                // copy 0 to starting_member_cnt to readied array
                for i in 0..self.starting_member_cnt {
                    self.readied.push(i);
                }
                self.start_round()?;
            }
            Ok(())
        }

        #[ink(message)]
        pub fn start_round(&mut self) -> Result<(), Error> {
            // only able to call this when game status is NotStarted or RoundEnded
            if !((self.game_status == GameStatus::NotStarted) ||
            (self.game_status == GameStatus::RoundEnded)) {
                return Err(Error::InvalidStatus);
            }

            // copy readied array to matched array
            self.matched = self.readied.clone();

            // TODO: implement shuffle (FUTURE IMPL)
            // self.env.random();
            // // check if enough players joined
            // // if yes, shuffle
            // use rand::seq::SliceRandom;
            // let mut rng = ink_prelude::rand::thread_rng();
            // // load joined array to a variable
            // let mut values = self.joined.clone();
            // values.shuffle(&mut rng);
            // // if no, do nothing

            // change status to RoundStarted
            self.current_round_no += 1;
            // set required moved member count from readied count, ignore last one if odd
            let matched_cnt = self.matched.len() as u16;
            self.required_moved_member_cnt = matched_cnt - matched_cnt % 2;
            self.current_moved_member_cnt = 0;
            self.current_vote_cnt = 0;

            // set time limit
            self.phase_ended_at = self.env().block_timestamp() + self.move_time_limit;

            self.game_status = GameStatus::RoundStarted;

            Ok(())
        }

        #[ink(message)]
        pub fn test_hash_generation(&self, rps_move: u8, salt_string: String) -> [u8; 32] {
            let salt = salt_string.as_bytes();

            if rps_move > 3 || rps_move == 0 {
                panic!("Invalid RPS Move");
            }

            // generate salted_hash from rps_move and salt
            // byte slices mergine rps_move and salt
            let rps_vec = rps_move.to_be_bytes().to_vec();
            let salt_vec = salt.to_vec();
            let buffer = [rps_vec, salt_vec].concat();

            // make 
            let mut h1 = [0; 32];
            Blake2x256::hash(&buffer, &mut h1);
            h1
        }

        pub fn decode_hex(s: &str) -> Vec<u8> {
            (0..s.len()).step_by(2).map(|i| u8::from_str_radix(&s[i..i + 2], 16).unwrap())
            .collect::<Vec<u8>>()
        }
        #[ink(message)]
        pub fn make_move(&mut self, joined_id: u16, salted_hash_hex_string: String) -> Result<(), Error> {
            // check if game status is RoundStarted
            if self.game_status != GameStatus::RoundStarted {
                return Err(Error::InvalidStatus);
            }            

            // take member to change
            let account_id = self.env().caller();
            let member = &mut self.joined[joined_id as usize];
            // check if account id is same as caller
            if member.owner != account_id {
                return Err(Error::InvalidStatus);
            }
            if member.life == 0 {
                return Err(Error::InvalidStatus);
            }

            // salted_hash_hex_string example: 0x03170a2e7597b7b7e3d84c05391d139a62b157e78786d8c082f29dcf4c111314
            // convert salted_hash_hex_string to salted_hash
            let salted_hash_hex_string = salted_hash_hex_string.trim_start_matches("0x");
            let salted_hash = Self::decode_hex(salted_hash_hex_string).try_into().unwrap();

            // store salted_hash into member
            member.salted_hash = salted_hash;
            
            // check the member is not the last member of matched array or the matched is even
            if (self.matched[self.matched.len() - 1] != joined_id)
            || (self.matched.len() % 2 == 0) {
                // if so, check last_moved_at is not current_round_no
                if member.last_moved_at != self.current_round_no {
                    // update last_moved_at to round no
                    member.last_moved_at = self.current_round_no;
                    // increase current_moved_member_cnt
                    self.current_moved_member_cnt += 1;
                }
            }

            Ok(())
        }

        #[ink(message)]
        pub fn halt_round(&mut self) -> Result<(), Error> {
            // only able to call this when game status is RoundStarted
            if self.game_status != GameStatus::RoundStarted {
                return Err(Error::InvalidStatus);
            }

            // check if time limit is reached
            if self.env().block_timestamp() < self.phase_ended_at {
                return Err(Error::InvalidStatus);
            }

            // // check required count is reached
            // if self.current_moved_member_cnt < self.required_moved_member_cnt {
            //     panic!("Not enough members moved, required count is {}, current count is {}", self.required_moved_member_cnt, self.current_moved_member_cnt)
            // }

            // set time limit
            self.phase_ended_at = self.env().block_timestamp() + self.reveal_time_limit;

            // change status to RoundHalted
            self.game_status = GameStatus::RoundHalted;

            Ok(())
        }

        /// verify move
        ///
        #[ink(message)]
        pub fn verify_move(&mut self, joined_id: u16, rps_move: u8, salt_string: String) -> Result<(), Error> {
            // check if game status is RoundStarted
            if self.game_status != GameStatus::RoundHalted {
                return Err(Error::InvalidStatus);
            }

            let salt = salt_string.as_bytes();

            // take member to change
            let account_id = self.env().caller();
            let member = &mut self.joined[joined_id as usize];
            // check if account id is same as caller
            if member.owner != account_id {
                panic!("Invalid caller, caller is {:?}, member owner is {:?}", account_id, member.owner)
            }
            if member.last_moved_at != self.current_round_no {
                panic!("Invalid last_moved_at, last_moved_at is {}, current_round_no is {}", member.last_moved_at, self.current_round_no);
            }

            // check if rps_move is 1~3
            if rps_move > 3 || rps_move == 0 {
                panic!("Invalid rps_move, rps_move is {}", rps_move);
            }

            // generate salted_hash from rps_move and salt
            // byte slices mergine rps_move and salt
            let rps_vec = rps_move.to_be_bytes().to_vec();
            let salt_vec = salt.to_vec();
            let buffer = [rps_vec, salt_vec].concat();

            // make 
            let mut h1 = [0; 32];
            Blake2x256::hash(&buffer, &mut h1);

            // check if salted_hash is same as member.salted_hash
            if h1 != member.salted_hash {
                panic!("Invalid salted_hash, salted_hash is {:?}, member salted_hash is {:?}", h1, member.salted_hash);
            }

            // set rps_move to member
            member.rps_move = rps_move;

            Ok(())
        }

        fn _check_winner(left_rps: u8, right_rps: u8) -> i8{
            match left_rps {
                0 => { // none
                    match right_rps {
                        0 => 0,
                        1 => 1,
                        2 => 1,
                        3 => 1,
                        _ => panic!("Invalid rps_move"),
                    }
                },
                1 => { // rock
                    match right_rps {
                        0 => -1,
                        1 => 0,
                        2 => 1,
                        3 => -1,
                        _ => panic!("Invalid rps_move"),
                    }
                },
                2 => { // paper
                    match right_rps {
                        0 => -1,
                        1 => -1,
                        2 => 0,
                        3 => 1,
                        _ => panic!("Invalid rps_move"),
                    }
                },
                3 => { // scissor
                    match right_rps {
                        0 => -1,
                        1 => 1,
                        2 => -1,
                        3 => 0,
                        _ => panic!("Invalid rps_move"),
                    }
                }
                _ => panic!("Invalid rps_move"),
            }
        }

        #[ink(message)]
        pub fn process_match(&mut self) -> Result<(), Error> {
            // only able to call this when game status is RoundHalted
            if self.game_status != GameStatus::RoundHalted {
                return Err(Error::InvalidStatus);
            }

            // check if time limit is reached
            if self.env().block_timestamp() < self.phase_ended_at {
                return Err(Error::InvalidStatus);
            }

            let current_match_cnt = self.matched.len() / 2;
            // for each match (odd vs even), check if rps_move is same
            for i in 0..current_match_cnt {
                let member1_rps = self.joined[self.matched[i * 2] as usize].rps_move;
                let member2_rps = self.joined[self.matched[i * 2 + 1] as usize].rps_move;
                let winner_check = Self::_check_winner(member1_rps, member2_rps);
                match winner_check {
                    -1 => {
                        // cut member2's life
                        self.joined[self.matched[i * 2 + 1] as usize].life -= 1;
                        if self.joined[self.matched[i * 2 + 1] as usize].life == 0 {
                            self.burn_from_contract(self.joined[self.matched[i * 2 + 1] as usize].token_id)?;
                        }
                    },
                    1 => {
                        // cut member1's life
                        self.joined[self.matched[i * 2] as usize].life -= 1;
                        if self.joined[self.matched[i * 2] as usize].life == 0 {
                            self.burn_from_contract(self.joined[self.matched[i * 2] as usize].token_id)?;
                        }
                    },
                    _ => {
                        // check if both are 0, if so, do remove both
                        if member1_rps == 0 && member2_rps == 0 {
                            self.joined[self.matched[i * 2] as usize].life -= 1;
                            self.joined[self.matched[i * 2 + 1] as usize].life -= 1;
                            if self.joined[self.matched[i * 2] as usize].life == 0 {
                                self.burn_from_contract(self.joined[self.matched[i * 2] as usize].token_id)?;
                            }
                            if self.joined[self.matched[i * 2 + 1] as usize].life == 0 {
                                self.burn_from_contract(self.joined[self.matched[i * 2 + 1] as usize].token_id)?;
                            }                            
                        }
                        // do nothing
                    }
                }
            }

            // check if there is any member's life is 0, if so, exlude from adding to ready array
            self.readied = Vec::new();
            for i in 0..self.joined.len() {
                if self.joined[i].life != 0 {
                    self.joined[i].rps_move = 0;
                    self.readied.push(i as u16);
                }
            }

            // end on ending condtion
            // for each vote_match_no round, set status to GameVote
            if self.readied.len() == self.game_end_member_cnt as usize {
                self.game_status = GameStatus::GameEnded;
                let readied_cnt = self.readied.len();
                self.allocated_value = self.allocated_value / readied_cnt as u128;
            } else if self.current_round_no % self.vote_per_round as u32 == 0 {
                self.game_status = GameStatus::GameVote;
                // set time limit
                self.phase_ended_at = self.env().block_timestamp() + self.vote_time_limit;
            } else {
                self.game_status = GameStatus::RoundEnded;
            }

            Ok(())
        }

        /// vote on halt
        ///
        #[ink(message)]
        pub fn vote_on_halt(&mut self, joined_id: u16, vote_state: u8) {
            // check if game status is GameVote
            if self.game_status != GameStatus::GameVote {
                panic!("Invalid call on current game status, current status is {:?}", self.game_status);
            }
            // take member to change
            let account_id = self.env().caller();
            let member = &mut self.joined[joined_id as usize];
            if member.life == 0 {
                panic!("Invalid member, life is 0");
            }
            // check if account id is same as caller
            if member.owner != account_id {
                panic!("Invalid caller, caller is not owner of member");
            }

            if member.last_voted_at >= self.current_round_no {
                panic!("Invalid call, already voted");
            }
            member.last_voted_at = self.current_round_no;

            if vote_state == 1 {
                self.current_vote_cnt += 1;
            }
        }

        /// end game from vote
        #[ink(message)]
        pub fn process_vote(&mut self) -> Result<(), Error> {
            // check if game status is GameVote
            if self.game_status != GameStatus::GameVote {
                return Err(Error::InvalidStatus);
            }

            // check if time limit is reached
            if self.env().block_timestamp() < self.phase_ended_at {
                return Err(Error::InvalidStatus);
            }

            // check if current_vote_cnt is bigger than half of readied cnt
            if self.current_vote_cnt * 2 <= self.readied.len() as u16 {
                self.game_status = GameStatus::RoundEnded;
            } else {
                self.game_status = GameStatus::GameEnded;
                let readied_cnt = self.readied.len();
                self.allocated_value = self.allocated_value / 100 * 90 / readied_cnt as u128;
            }
            Ok(())
        }

        /// get reward
        #[ink(message)]
        pub fn get_reward(
            &mut self,
            joined_id: u16,
        ) -> Result<(), Error> {
            let caller = self.env().caller();

            // check if game status is GameEnded
            if self.game_status != GameStatus::GameEnded {
                return Err(Error::InvalidStatus);
            }

            // check if member has life
            if self.joined[joined_id as usize].life == 0 {
                return Err(Error::InvalidStatus);
            }

            // check the member is not rewarded
            if self.joined[joined_id as usize].is_rewarded {
                return Err(Error::InvalidStatus);
            }

            // transfer value to member
            // check caller is owner of member
            if self.joined[joined_id as usize].owner != caller {
                return Err(Error::InvalidStatus);
            }

            // transfer erc721 back to member
            self.transfer_from_contract(caller, self.joined[joined_id as usize].token_id)?;

            self.joined[joined_id as usize].is_rewarded = true;

            let required_value = self.allocated_value;

            if let Err(_) = Self::env().transfer(caller, required_value) {
                return Err(Error::TransferFailed);
            }
            Ok(())
        }


        /// Returns the balance of the owner.
        ///
        /// This represents the amount of unique tokens the owner has.
        #[ink(message)]
        pub fn balance_of(&self, owner: AccountId) -> u32 {
            self.balance_of_or_zero(&owner)
        }

        /// Returns the owner of the token.
        #[ink(message)]
        pub fn owner_of(&self, id: TokenId) -> Option<AccountId> {
            self.token_owner.get(id)
        }

        /// Returns the metadata url of the token.
        #[ink(message)]
        pub fn token_metadata(&self, id: TokenId) -> Option<String> {
            self.token_metadata.get(id)
        }

        /// Returns the approved account ID for this token if any.
        #[ink(message)]
        pub fn get_approved(&self, id: TokenId) -> Option<AccountId> {
            self.token_approvals.get(id)
        }

        /// Returns `true` if the operator is approved by the owner.
        #[ink(message)]
        pub fn is_approved_for_all(&self, owner: AccountId, operator: AccountId) -> bool {
            self.approved_for_all(owner, operator)
        }

        /// Approves or disapproves the operator for all tokens of the caller.
        #[ink(message)]
        pub fn set_approval_for_all(
            &mut self,
            to: AccountId,
            approved: bool,
        ) -> Result<(), Error> {
            self.approve_for_all(to, approved)?;
            Ok(())
        }

        /// Approves the account to transfer the specified token on behalf of the caller.
        #[ink(message)]
        pub fn approve(&mut self, to: AccountId, id: TokenId) -> Result<(), Error> {
            self.approve_for(&to, id)?;
            Ok(())
        }

        /// Transfers the token from the caller to the given destination.
        #[ink(message)]
        pub fn transfer(
            &mut self,
            destination: AccountId,
            id: TokenId,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            self.transfer_token_from(&caller, &destination, id)?;
            Ok(())
        }

        /// Transfer approved or owned token.
        #[ink(message)]
        pub fn transfer_from(
            &mut self,
            from: AccountId,
            to: AccountId,
            id: TokenId,
        ) -> Result<(), Error> {
            self.transfer_token_from(&from, &to, id)?;
            Ok(())
        }

        /// Creates a new token.
        #[ink(message, payable)]
        pub fn mint(&mut self, id: TokenId, json_url: String) -> Result<(), Error> {
            let caller = self.env().caller();

            let balance = Self::env().transferred_value();

            if balance != self.mint_cost {
                return Err(Error::InvalidValue);
            }
            self.allocated_value = self.allocated_value + balance;

            self.add_token_with_metadata_to(&caller, id, json_url)?;
            
            self.env().emit_event(Transfer {
                from: Some(AccountId::from([0x0; 32])),
                to: Some(caller),
                id,
            });
            Ok(())
        }

        pub fn transfer_from_contract(
            &mut self,
            to: AccountId,
            id: TokenId,
        ) -> Result<(), Error> {
            // contract's account ID
            let contract_account_id = ink::env::account_id::<ink::env::DefaultEnvironment>();

            if !self.exists(id) {
                return Err(Error::TokenNotFound)
            };
            if !self.approved_or_owner(Some(contract_account_id), id) {
                return Err(Error::NotApproved)
            };
            self.clear_approval(id);
            self.remove_token_from(&contract_account_id, id)?;
            self.add_token_to(&to, id)?;
            self.env().emit_event(Transfer {
                from: Some(contract_account_id),
                to: Some(to),
                id,
            });
            Ok(())
        }

        pub fn burn_from_contract(&mut self, id: TokenId) -> Result<(), Error> {
            // contract's account ID
            let contract_account_id = ink::env::account_id::<ink::env::DefaultEnvironment>();

            let Self {
                token_owner,
                owned_tokens_count,
                ..
            } = self;

            let owner = token_owner.get(id).ok_or(Error::TokenNotFound)?;
            if owner != contract_account_id {
                return Err(Error::NotOwner)
            };

            let count = owned_tokens_count
                .get(contract_account_id)
                .map(|c| c - 1)
                .ok_or(Error::CannotFetchValue)?;
            owned_tokens_count.insert(contract_account_id, &count);
            token_owner.remove(id);

            self.env().emit_event(Transfer {
                from: Some(contract_account_id),
                to: Some(AccountId::from([0x0; 32])),
                id,
            });

            Ok(())
        }

        /// Deletes an existing token. Only the owner can burn the token.
        #[ink(message)]
        pub fn burn(&mut self, id: TokenId) -> Result<(), Error> {
            let caller = self.env().caller();
            let Self {
                token_owner,
                owned_tokens_count,
                ..
            } = self;

            let owner = token_owner.get(id).ok_or(Error::TokenNotFound)?;
            if owner != caller {
                return Err(Error::NotOwner)
            };

            let count = owned_tokens_count
                .get(caller)
                .map(|c| c - 1)
                .ok_or(Error::CannotFetchValue)?;
            owned_tokens_count.insert(caller, &count);
            token_owner.remove(id);

            self.env().emit_event(Transfer {
                from: Some(caller),
                to: Some(AccountId::from([0x0; 32])),
                id,
            });

            Ok(())
        }

        /// Transfers token `id` `from` the sender to the `to` `AccountId`.
        fn transfer_token_from(
            &mut self,
            from: &AccountId,
            to: &AccountId,
            id: TokenId,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            if !self.exists(id) {
                return Err(Error::TokenNotFound)
            };
            if !self.approved_or_owner(Some(caller), id) {
                return Err(Error::NotApproved)
            };
            self.clear_approval(id);
            self.remove_token_from(from, id)?;
            self.add_token_to(to, id)?;
            self.env().emit_event(Transfer {
                from: Some(*from),
                to: Some(*to),
                id,
            });
            Ok(())
        }

        /// Removes token `id` from the owner.
        fn remove_token_from(
            &mut self,
            from: &AccountId,
            id: TokenId,
        ) -> Result<(), Error> {
            let Self {
                token_owner,
                owned_tokens_count,
                ..
            } = self;

            if !token_owner.contains(id) {
                return Err(Error::TokenNotFound)
            }

            let count = owned_tokens_count
                .get(from)
                .map(|c| c - 1)
                .ok_or(Error::CannotFetchValue)?;
            owned_tokens_count.insert(from, &count);
            token_owner.remove(id);

            Ok(())
        }

        /// Adds the token `id` to the `to` AccountID.
        fn add_token_to(&mut self, to: &AccountId, id: TokenId) -> Result<(), Error> {
            let Self {
                token_owner,
                owned_tokens_count,
                ..
            } = self;

            if token_owner.contains(id) {
                return Err(Error::TokenExists)
            }

            if *to == AccountId::from([0x0; 32]) {
                return Err(Error::NotAllowed)
            };

            let count = owned_tokens_count.get(to).map(|c| c + 1).unwrap_or(1);

            owned_tokens_count.insert(to, &count);
            token_owner.insert(id, to);

            Ok(())
        }

        /// Adds the token `id` to the `to` AccountID.
        fn add_token_with_metadata_to(&mut self, to: &AccountId, id: TokenId, json_url: String) -> Result<(), Error> {
            let Self {
                token_owner,
                owned_tokens_count,
                token_metadata,
                ..
            } = self;

            if token_owner.contains(id) {
                return Err(Error::TokenExists)
            }

            if *to == AccountId::from([0x0; 32]) {
                return Err(Error::NotAllowed)
            };

            let count = owned_tokens_count.get(to).map(|c| c + 1).unwrap_or(1);

            owned_tokens_count.insert(to, &count);
            token_owner.insert(id, to);
            token_metadata.insert(id, &json_url);

            Ok(())
        }

        /// Approves or disapproves the operator to transfer all tokens of the caller.
        fn approve_for_all(
            &mut self,
            to: AccountId,
            approved: bool,
        ) -> Result<(), Error> {
            let caller = self.env().caller();
            if to == caller {
                return Err(Error::NotAllowed)
            }
            self.env().emit_event(ApprovalForAll {
                owner: caller,
                operator: to,
                approved,
            });

            if approved {
                self.operator_approvals.insert((&caller, &to), &());
            } else {
                self.operator_approvals.remove((&caller, &to));
            }

            Ok(())
        }

        /// Approve the passed `AccountId` to transfer the specified token on behalf of
        /// the message's sender.
        fn approve_for(&mut self, to: &AccountId, id: TokenId) -> Result<(), Error> {
            let caller = self.env().caller();
            let owner = self.owner_of(id);
            if !(owner == Some(caller)
                || self.approved_for_all(owner.expect("Error with AccountId"), caller))
            {
                return Err(Error::NotAllowed)
            };

            if *to == AccountId::from([0x0; 32]) {
                return Err(Error::NotAllowed)
            };

            if self.token_approvals.contains(id) {
                return Err(Error::CannotInsert)
            } else {
                self.token_approvals.insert(id, to);
            }

            self.env().emit_event(Approval {
                from: caller,
                to: *to,
                id,
            });

            Ok(())
        }

        /// Removes existing approval from token `id`.
        fn clear_approval(&mut self, id: TokenId) {
            self.token_approvals.remove(id);
        }

        // Returns the total number of tokens from an account.
        fn balance_of_or_zero(&self, of: &AccountId) -> u32 {
            self.owned_tokens_count.get(of).unwrap_or(0)
        }

        /// Gets an operator on other Account's behalf.
        fn approved_for_all(&self, owner: AccountId, operator: AccountId) -> bool {
            self.operator_approvals.contains((&owner, &operator))
        }

        /// Returns true if the `AccountId` `from` is the owner of token `id`
        /// or it has been approved on behalf of the token `id` owner.
        fn approved_or_owner(&self, from: Option<AccountId>, id: TokenId) -> bool {
            let owner = self.owner_of(id);
            from != Some(AccountId::from([0x0; 32]))
                && (from == owner
                    || from == self.token_approvals.get(id)
                    || self.approved_for_all(
                        owner.expect("Error with AccountId"),
                        from.expect("Error with AccountId"),
                    ))
        }

        /// Returns true if token `id` exists or false if it does not.
        fn exists(&self, id: TokenId) -> bool {
            self.token_owner.contains(id)
        }
    }
}
