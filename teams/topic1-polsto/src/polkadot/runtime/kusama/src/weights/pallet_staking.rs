// Copyright 2017-2022 Parity Technologies (UK) Ltd.
// This file is part of Polkadot.

// Polkadot is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Polkadot is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Polkadot.  If not, see <http://www.gnu.org/licenses/>.
//! Autogenerated weights for `pallet_staking`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2023-01-11, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! HOSTNAME: `bm5`, CPU: `Intel(R) Core(TM) i7-7700K CPU @ 4.20GHz`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("kusama-dev"), DB CACHE: 1024

// Executed Command:
// ./target/production/polkadot
// benchmark
// pallet
// --chain=kusama-dev
// --steps=50
// --repeat=20
// --pallet=pallet_staking
// --extrinsic=*
// --execution=wasm
// --wasm-execution=compiled
// --header=./file_header.txt
// --output=./runtime/kusama/src/weights/

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `pallet_staking`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> pallet_staking::WeightInfo for WeightInfo<T> {
	// Storage: Staking Bonded (r:1 w:1)
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: Staking Payee (r:0 w:1)
	fn bond() -> Weight {
		// Minimum execution time: 46_225 nanoseconds.
		Weight::from_ref_time(46_884_000)
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(4))
	}
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: VoterList ListNodes (r:3 w:3)
	// Storage: VoterList ListBags (r:2 w:2)
	fn bond_extra() -> Weight {
		// Minimum execution time: 82_086 nanoseconds.
		Weight::from_ref_time(82_789_000)
			.saturating_add(T::DbWeight::get().reads(8))
			.saturating_add(T::DbWeight::get().writes(7))
	}
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking Nominators (r:1 w:0)
	// Storage: Staking MinNominatorBond (r:1 w:0)
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: VoterList ListNodes (r:3 w:3)
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: VoterList ListBags (r:2 w:2)
	fn unbond() -> Weight {
		// Minimum execution time: 88_395 nanoseconds.
		Weight::from_ref_time(89_030_000)
			.saturating_add(T::DbWeight::get().reads(12))
			.saturating_add(T::DbWeight::get().writes(8))
	}
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	/// The range of component `s` is `[0, 100]`.
	fn withdraw_unbonded_update(s: u32, ) -> Weight {
		// Minimum execution time: 39_108 nanoseconds.
		Weight::from_ref_time(41_334_480)
			// Standard Error: 2_009
			.saturating_add(Weight::from_ref_time(24_723).saturating_mul(s.into()))
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Staking Bonded (r:1 w:1)
	// Storage: Staking SlashingSpans (r:1 w:0)
	// Storage: Staking Validators (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	// Storage: Staking CounterForNominators (r:1 w:1)
	// Storage: VoterList ListNodes (r:2 w:2)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: Staking Payee (r:0 w:1)
	// Storage: Staking SpanSlash (r:0 w:2)
	/// The range of component `s` is `[0, 100]`.
	fn withdraw_unbonded_kill(s: u32, ) -> Weight {
		// Minimum execution time: 77_055 nanoseconds.
		Weight::from_ref_time(82_323_354)
			// Standard Error: 2_448
			.saturating_add(Weight::from_ref_time(908_731).saturating_mul(s.into()))
			.saturating_add(T::DbWeight::get().reads(13))
			.saturating_add(T::DbWeight::get().writes(12))
			.saturating_add(T::DbWeight::get().writes((1_u64).saturating_mul(s.into())))
	}
	// Storage: Staking Ledger (r:1 w:0)
	// Storage: Staking MinValidatorBond (r:1 w:0)
	// Storage: Staking MinCommission (r:1 w:0)
	// Storage: Staking Validators (r:1 w:1)
	// Storage: Staking MaxValidatorsCount (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:0)
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: VoterList ListNodes (r:1 w:1)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	// Storage: Staking CounterForValidators (r:1 w:1)
	fn validate() -> Weight {
		// Minimum execution time: 59_210 nanoseconds.
		Weight::from_ref_time(59_693_000)
			.saturating_add(T::DbWeight::get().reads(11))
			.saturating_add(T::DbWeight::get().writes(5))
	}
	// Storage: Staking Ledger (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	/// The range of component `k` is `[1, 128]`.
	fn kick(k: u32, ) -> Weight {
		// Minimum execution time: 33_792 nanoseconds.
		Weight::from_ref_time(32_802_713)
			// Standard Error: 10_559
			.saturating_add(Weight::from_ref_time(6_723_236).saturating_mul(k.into()))
			.saturating_add(T::DbWeight::get().reads(1))
			.saturating_add(T::DbWeight::get().reads((1_u64).saturating_mul(k.into())))
			.saturating_add(T::DbWeight::get().writes((1_u64).saturating_mul(k.into())))
	}
	// Storage: Staking Ledger (r:1 w:0)
	// Storage: Staking MinNominatorBond (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	// Storage: Staking MaxNominatorsCount (r:1 w:0)
	// Storage: Staking Validators (r:2 w:0)
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: VoterList ListNodes (r:2 w:2)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	// Storage: Staking CounterForNominators (r:1 w:1)
	/// The range of component `n` is `[1, 24]`.
	fn nominate(n: u32, ) -> Weight {
		// Minimum execution time: 62_794 nanoseconds.
		Weight::from_ref_time(62_131_011)
			// Standard Error: 8_364
			.saturating_add(Weight::from_ref_time(2_489_101).saturating_mul(n.into()))
			.saturating_add(T::DbWeight::get().reads(12))
			.saturating_add(T::DbWeight::get().reads((1_u64).saturating_mul(n.into())))
			.saturating_add(T::DbWeight::get().writes(6))
	}
	// Storage: Staking Ledger (r:1 w:0)
	// Storage: Staking Validators (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	// Storage: Staking CounterForNominators (r:1 w:1)
	// Storage: VoterList ListNodes (r:2 w:2)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	fn chill() -> Weight {
		// Minimum execution time: 58_444 nanoseconds.
		Weight::from_ref_time(59_019_000)
			.saturating_add(T::DbWeight::get().reads(8))
			.saturating_add(T::DbWeight::get().writes(6))
	}
	// Storage: Staking Ledger (r:1 w:0)
	// Storage: Staking Payee (r:0 w:1)
	fn set_payee() -> Weight {
		// Minimum execution time: 15_296 nanoseconds.
		Weight::from_ref_time(15_835_000)
			.saturating_add(T::DbWeight::get().reads(1))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking Bonded (r:1 w:1)
	// Storage: Staking Ledger (r:2 w:2)
	fn set_controller() -> Weight {
		// Minimum execution time: 21_762 nanoseconds.
		Weight::from_ref_time(22_572_000)
			.saturating_add(T::DbWeight::get().reads(3))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Staking ValidatorCount (r:0 w:1)
	fn set_validator_count() -> Weight {
		// Minimum execution time: 4_223 nanoseconds.
		Weight::from_ref_time(4_391_000)
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking ForceEra (r:0 w:1)
	fn force_no_eras() -> Weight {
		// Minimum execution time: 16_128 nanoseconds.
		Weight::from_ref_time(16_640_000)
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking ForceEra (r:0 w:1)
	fn force_new_era() -> Weight {
		// Minimum execution time: 16_147 nanoseconds.
		Weight::from_ref_time(16_642_000)
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking ForceEra (r:0 w:1)
	fn force_new_era_always() -> Weight {
		// Minimum execution time: 16_033 nanoseconds.
		Weight::from_ref_time(16_465_000)
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking Invulnerables (r:0 w:1)
	/// The range of component `v` is `[0, 1000]`.
	fn set_invulnerables(v: u32, ) -> Weight {
		// Minimum execution time: 4_301 nanoseconds.
		Weight::from_ref_time(4_818_792)
			// Standard Error: 35
			.saturating_add(Weight::from_ref_time(10_479).saturating_mul(v.into()))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking Bonded (r:1 w:1)
	// Storage: Staking SlashingSpans (r:1 w:0)
	// Storage: Staking Validators (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	// Storage: Staking CounterForNominators (r:1 w:1)
	// Storage: VoterList ListNodes (r:2 w:2)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: Staking Ledger (r:0 w:1)
	// Storage: Staking Payee (r:0 w:1)
	// Storage: Staking SpanSlash (r:0 w:2)
	/// The range of component `s` is `[0, 100]`.
	fn force_unstake(s: u32, ) -> Weight {
		// Minimum execution time: 70_878 nanoseconds.
		Weight::from_ref_time(75_949_648)
			// Standard Error: 1_704
			.saturating_add(Weight::from_ref_time(905_705).saturating_mul(s.into()))
			.saturating_add(T::DbWeight::get().reads(11))
			.saturating_add(T::DbWeight::get().writes(12))
			.saturating_add(T::DbWeight::get().writes((1_u64).saturating_mul(s.into())))
	}
	// Storage: Staking UnappliedSlashes (r:1 w:1)
	/// The range of component `s` is `[1, 1000]`.
	fn cancel_deferred_slash(s: u32, ) -> Weight {
		// Minimum execution time: 119_251 nanoseconds.
		Weight::from_ref_time(1_332_578_423)
			// Standard Error: 88_242
			.saturating_add(Weight::from_ref_time(7_435_300).saturating_mul(s.into()))
			.saturating_add(T::DbWeight::get().reads(1))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Staking ErasValidatorReward (r:1 w:0)
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking ErasStakersClipped (r:1 w:0)
	// Storage: Staking ErasRewardPoints (r:1 w:0)
	// Storage: Staking ErasValidatorPrefs (r:1 w:0)
	// Storage: Staking Payee (r:1 w:0)
	// Storage: System Account (r:1 w:1)
	/// The range of component `n` is `[0, 512]`.
	fn payout_stakers_dead_controller(n: u32, ) -> Weight {
		// Minimum execution time: 107_162 nanoseconds.
		Weight::from_ref_time(211_839_279)
			// Standard Error: 17_368
			.saturating_add(Weight::from_ref_time(21_497_225).saturating_mul(n.into()))
			.saturating_add(T::DbWeight::get().reads(9))
			.saturating_add(T::DbWeight::get().reads((3_u64).saturating_mul(n.into())))
			.saturating_add(T::DbWeight::get().writes(2))
			.saturating_add(T::DbWeight::get().writes((1_u64).saturating_mul(n.into())))
	}
	// Storage: Staking CurrentEra (r:1 w:0)
	// Storage: Staking ErasValidatorReward (r:1 w:0)
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking ErasStakersClipped (r:1 w:0)
	// Storage: Staking ErasRewardPoints (r:1 w:0)
	// Storage: Staking ErasValidatorPrefs (r:1 w:0)
	// Storage: Staking Payee (r:1 w:0)
	// Storage: System Account (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	/// The range of component `n` is `[0, 512]`.
	fn payout_stakers_alive_staked(n: u32, ) -> Weight {
		// Minimum execution time: 123_391 nanoseconds.
		Weight::from_ref_time(67_805_421)
			// Standard Error: 119_484
			.saturating_add(Weight::from_ref_time(32_012_077).saturating_mul(n.into()))
			.saturating_add(T::DbWeight::get().reads(10))
			.saturating_add(T::DbWeight::get().reads((5_u64).saturating_mul(n.into())))
			.saturating_add(T::DbWeight::get().writes(3))
			.saturating_add(T::DbWeight::get().writes((3_u64).saturating_mul(n.into())))
	}
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	// Storage: VoterList ListNodes (r:3 w:3)
	// Storage: Staking Bonded (r:1 w:0)
	// Storage: VoterList ListBags (r:2 w:2)
	/// The range of component `l` is `[1, 32]`.
	fn rebond(l: u32, ) -> Weight {
		// Minimum execution time: 81_605 nanoseconds.
		Weight::from_ref_time(84_323_235)
			// Standard Error: 6_874
			.saturating_add(Weight::from_ref_time(30_456).saturating_mul(l.into()))
			.saturating_add(T::DbWeight::get().reads(9))
			.saturating_add(T::DbWeight::get().writes(8))
	}
	// Storage: System Account (r:1 w:1)
	// Storage: Staking Bonded (r:1 w:1)
	// Storage: Staking Ledger (r:1 w:1)
	// Storage: Staking SlashingSpans (r:1 w:1)
	// Storage: Staking Validators (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	// Storage: Staking CounterForNominators (r:1 w:1)
	// Storage: VoterList ListNodes (r:2 w:2)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	// Storage: Balances Locks (r:1 w:1)
	// Storage: Staking Payee (r:0 w:1)
	// Storage: Staking SpanSlash (r:0 w:1)
	/// The range of component `s` is `[1, 100]`.
	fn reap_stash(s: u32, ) -> Weight {
		// Minimum execution time: 83_047 nanoseconds.
		Weight::from_ref_time(83_752_107)
			// Standard Error: 2_166
			.saturating_add(Weight::from_ref_time(904_436).saturating_mul(s.into()))
			.saturating_add(T::DbWeight::get().reads(12))
			.saturating_add(T::DbWeight::get().writes(12))
			.saturating_add(T::DbWeight::get().writes((1_u64).saturating_mul(s.into())))
	}
	// Storage: VoterList CounterForListNodes (r:1 w:0)
	// Storage: VoterList ListBags (r:166 w:0)
	// Storage: VoterList ListNodes (r:101 w:0)
	// Storage: Staking Nominators (r:101 w:0)
	// Storage: Staking Validators (r:2 w:0)
	// Storage: Staking Bonded (r:101 w:0)
	// Storage: Staking Ledger (r:101 w:0)
	// Storage: System BlockWeight (r:1 w:1)
	// Storage: Staking CounterForValidators (r:1 w:0)
	// Storage: Staking ValidatorCount (r:1 w:0)
	// Storage: Staking MinimumValidatorCount (r:1 w:0)
	// Storage: Staking CurrentEra (r:1 w:1)
	// Storage: Staking ErasStakersClipped (r:0 w:1)
	// Storage: Staking ErasValidatorPrefs (r:0 w:1)
	// Storage: Staking ErasStakers (r:0 w:1)
	// Storage: Staking ErasTotalStake (r:0 w:1)
	// Storage: Staking ErasStartSessionIndex (r:0 w:1)
	// Storage: Staking MinimumActiveStake (r:0 w:1)
	/// The range of component `v` is `[1, 10]`.
	/// The range of component `n` is `[0, 100]`.
	fn new_era(v: u32, n: u32, ) -> Weight {
		// Minimum execution time: 426_412 nanoseconds.
		Weight::from_ref_time(429_495_000)
			// Standard Error: 1_771_114
			.saturating_add(Weight::from_ref_time(58_774_598).saturating_mul(v.into()))
			// Standard Error: 176_481
			.saturating_add(Weight::from_ref_time(13_025_815).saturating_mul(n.into()))
			.saturating_add(T::DbWeight::get().reads(173))
			.saturating_add(T::DbWeight::get().reads((5_u64).saturating_mul(v.into())))
			.saturating_add(T::DbWeight::get().reads((4_u64).saturating_mul(n.into())))
			.saturating_add(T::DbWeight::get().writes(5))
			.saturating_add(T::DbWeight::get().writes((3_u64).saturating_mul(v.into())))
	}
	// Storage: VoterList CounterForListNodes (r:1 w:0)
	// Storage: VoterList ListBags (r:166 w:0)
	// Storage: VoterList ListNodes (r:1500 w:0)
	// Storage: Staking Nominators (r:1500 w:0)
	// Storage: Staking Validators (r:500 w:0)
	// Storage: Staking Bonded (r:1500 w:0)
	// Storage: Staking Ledger (r:1500 w:0)
	// Storage: System BlockWeight (r:1 w:1)
	// Storage: Staking MinimumActiveStake (r:0 w:1)
	/// The range of component `v` is `[500, 1000]`.
	/// The range of component `n` is `[500, 1000]`.
	fn get_npos_voters(v: u32, n: u32, ) -> Weight {
		// Minimum execution time: 25_376_926 nanoseconds.
		Weight::from_ref_time(25_562_737_000)
			// Standard Error: 572_970
			.saturating_add(Weight::from_ref_time(5_264_964).saturating_mul(v.into()))
			// Standard Error: 572_970
			.saturating_add(Weight::from_ref_time(4_590_215).saturating_mul(n.into()))
			.saturating_add(T::DbWeight::get().reads(168))
			.saturating_add(T::DbWeight::get().reads((5_u64).saturating_mul(v.into())))
			.saturating_add(T::DbWeight::get().reads((4_u64).saturating_mul(n.into())))
			.saturating_add(T::DbWeight::get().writes(2))
	}
	// Storage: Staking CounterForValidators (r:1 w:0)
	// Storage: Staking Validators (r:501 w:0)
	// Storage: System BlockWeight (r:1 w:1)
	/// The range of component `v` is `[500, 1000]`.
	fn get_npos_targets(v: u32, ) -> Weight {
		// Minimum execution time: 3_520_129 nanoseconds.
		Weight::from_ref_time(3_656_688_000)
			// Standard Error: 41_807
			.saturating_add(Weight::from_ref_time(2_624_109).saturating_mul(v.into()))
			.saturating_add(T::DbWeight::get().reads(3))
			.saturating_add(T::DbWeight::get().reads((1_u64).saturating_mul(v.into())))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking MinCommission (r:0 w:1)
	// Storage: Staking MinValidatorBond (r:0 w:1)
	// Storage: Staking MaxValidatorsCount (r:0 w:1)
	// Storage: Staking ChillThreshold (r:0 w:1)
	// Storage: Staking MaxNominatorsCount (r:0 w:1)
	// Storage: Staking MinNominatorBond (r:0 w:1)
	fn set_staking_configs_all_set() -> Weight {
		// Minimum execution time: 7_565 nanoseconds.
		Weight::from_ref_time(7_798_000)
			.saturating_add(T::DbWeight::get().writes(6))
	}
	// Storage: Staking MinCommission (r:0 w:1)
	// Storage: Staking MinValidatorBond (r:0 w:1)
	// Storage: Staking MaxValidatorsCount (r:0 w:1)
	// Storage: Staking ChillThreshold (r:0 w:1)
	// Storage: Staking MaxNominatorsCount (r:0 w:1)
	// Storage: Staking MinNominatorBond (r:0 w:1)
	fn set_staking_configs_all_remove() -> Weight {
		// Minimum execution time: 6_694 nanoseconds.
		Weight::from_ref_time(7_029_000)
			.saturating_add(T::DbWeight::get().writes(6))
	}
	// Storage: Staking Ledger (r:1 w:0)
	// Storage: Staking Nominators (r:1 w:1)
	// Storage: Staking ChillThreshold (r:1 w:0)
	// Storage: Staking MaxNominatorsCount (r:1 w:0)
	// Storage: Staking CounterForNominators (r:1 w:1)
	// Storage: Staking MinNominatorBond (r:1 w:0)
	// Storage: Staking Validators (r:1 w:0)
	// Storage: VoterList ListNodes (r:2 w:2)
	// Storage: VoterList ListBags (r:1 w:1)
	// Storage: VoterList CounterForListNodes (r:1 w:1)
	fn chill_other() -> Weight {
		// Minimum execution time: 69_704 nanoseconds.
		Weight::from_ref_time(70_564_000)
			.saturating_add(T::DbWeight::get().reads(11))
			.saturating_add(T::DbWeight::get().writes(6))
	}
	// Storage: Staking MinCommission (r:1 w:0)
	// Storage: Staking Validators (r:1 w:1)
	fn force_apply_min_commission() -> Weight {
		// Minimum execution time: 15_092 nanoseconds.
		Weight::from_ref_time(15_313_000)
			.saturating_add(T::DbWeight::get().reads(2))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Staking MinCommission (r:0 w:1)
	fn set_min_commission() -> Weight {
		// Minimum execution time: 4_296 nanoseconds.
		Weight::from_ref_time(4_464_000)
			.saturating_add(T::DbWeight::get().writes(1))
	}
}
