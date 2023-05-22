// Copyright 2021 Parity Technologies (UK) Ltd.
// This file is part of Cumulus.

// Cumulus is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cumulus is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Cumulus.  If not, see <http://www.gnu.org/licenses/>.

//! Autogenerated weights for `pallet_alliance`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 4.0.0-dev
//! DATE: 2023-01-13, STEPS: `50`, REPEAT: 20, LOW RANGE: `[]`, HIGH RANGE: `[]`
//! HOSTNAME: `bm4`, CPU: `Intel(R) Core(TM) i7-7700K CPU @ 4.20GHz`
//! EXECUTION: Some(Wasm), WASM-EXECUTION: Compiled, CHAIN: Some("collectives-polkadot-dev"), DB CACHE: 1024

// Executed Command:
// ./artifacts/polkadot-parachain
// benchmark
// pallet
// --chain=collectives-polkadot-dev
// --execution=wasm
// --wasm-execution=compiled
// --pallet=pallet_alliance
// --extrinsic=*
// --steps=50
// --repeat=20
// --json
// --header=./file_header.txt
// --output=./parachains/runtimes/collectives/collectives-polkadot/src/weights/pallet_alliance.rs

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]

use frame_support::{traits::Get, weights::Weight};
use sp_std::marker::PhantomData;

/// Weight functions for `pallet_alliance`.
pub struct WeightInfo<T>(PhantomData<T>);
impl<T: frame_system::Config> pallet_alliance::WeightInfo for WeightInfo<T> {
	// Storage: Alliance Members (r:1 w:0)
	// Storage: AllianceMotion ProposalOf (r:1 w:1)
	// Storage: AllianceMotion Proposals (r:1 w:1)
	// Storage: AllianceMotion ProposalCount (r:1 w:1)
	// Storage: AllianceMotion Voting (r:0 w:1)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[2, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn propose_proposed(b: u32, m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 34_149 nanoseconds.
		Weight::from_ref_time(35_870_577)
			// Standard Error: 76
			.saturating_add(Weight::from_ref_time(473).saturating_mul(b.into()))
			// Standard Error: 799
			.saturating_add(Weight::from_ref_time(20_695).saturating_mul(m.into()))
			// Standard Error: 789
			.saturating_add(Weight::from_ref_time(100_677).saturating_mul(p.into()))
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(4))
	}
	// Storage: Alliance Members (r:1 w:0)
	// Storage: AllianceMotion Voting (r:1 w:1)
	/// The range of component `m` is `[5, 100]`.
	fn vote(m: u32, ) -> Weight {
		// Minimum execution time: 30_567 nanoseconds.
		Weight::from_ref_time(31_627_050)
			// Standard Error: 757
			.saturating_add(Weight::from_ref_time(51_379).saturating_mul(m.into()))
			.saturating_add(T::DbWeight::get().reads(2))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Alliance Members (r:1 w:0)
	// Storage: AllianceMotion Voting (r:1 w:1)
	// Storage: AllianceMotion Members (r:1 w:0)
	// Storage: AllianceMotion Proposals (r:1 w:1)
	// Storage: AllianceMotion ProposalOf (r:0 w:1)
	/// The range of component `m` is `[4, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_early_disapproved(m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 39_472 nanoseconds.
		Weight::from_ref_time(37_685_222)
			// Standard Error: 681
			.saturating_add(Weight::from_ref_time(44_120).saturating_mul(m.into()))
			// Standard Error: 664
			.saturating_add(Weight::from_ref_time(88_787).saturating_mul(p.into()))
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Alliance Members (r:1 w:0)
	// Storage: AllianceMotion Voting (r:1 w:1)
	// Storage: AllianceMotion Members (r:1 w:0)
	// Storage: AllianceMotion ProposalOf (r:1 w:1)
	// Storage: AllianceMotion Proposals (r:1 w:1)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[4, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_early_approved(_b: u32, m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 49_845 nanoseconds.
		Weight::from_ref_time(48_754_290)
			// Standard Error: 872
			.saturating_add(Weight::from_ref_time(46_673).saturating_mul(m.into()))
			// Standard Error: 850
			.saturating_add(Weight::from_ref_time(96_920).saturating_mul(p.into()))
			.saturating_add(T::DbWeight::get().reads(5))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Alliance Members (r:1 w:0)
	// Storage: AllianceMotion Voting (r:1 w:1)
	// Storage: AllianceMotion Members (r:1 w:0)
	// Storage: AllianceMotion Prime (r:1 w:0)
	// Storage: AllianceMotion Proposals (r:1 w:1)
	// Storage: AllianceMotion ProposalOf (r:0 w:1)
	// Storage: Alliance Rule (r:0 w:1)
	/// The range of component `m` is `[2, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_disapproved(m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 46_639 nanoseconds.
		Weight::from_ref_time(49_396_487)
			// Standard Error: 3_353
			.saturating_add(Weight::from_ref_time(91_631).saturating_mul(m.into()))
			// Standard Error: 3_312
			.saturating_add(Weight::from_ref_time(109_305).saturating_mul(p.into()))
			.saturating_add(T::DbWeight::get().reads(6))
			.saturating_add(T::DbWeight::get().writes(4))
	}
	// Storage: Alliance Members (r:1 w:0)
	// Storage: AllianceMotion Voting (r:1 w:1)
	// Storage: AllianceMotion Members (r:1 w:0)
	// Storage: AllianceMotion Prime (r:1 w:0)
	// Storage: AllianceMotion Proposals (r:1 w:1)
	// Storage: AllianceMotion ProposalOf (r:0 w:1)
	/// The range of component `b` is `[1, 1024]`.
	/// The range of component `m` is `[5, 100]`.
	/// The range of component `p` is `[1, 100]`.
	fn close_approved(b: u32, m: u32, p: u32, ) -> Weight {
		// Minimum execution time: 40_637 nanoseconds.
		Weight::from_ref_time(36_491_541)
			// Standard Error: 159
			.saturating_add(Weight::from_ref_time(1_139).saturating_mul(b.into()))
			// Standard Error: 1_705
			.saturating_add(Weight::from_ref_time(57_742).saturating_mul(m.into()))
			// Standard Error: 1_644
			.saturating_add(Weight::from_ref_time(94_973).saturating_mul(p.into()))
			.saturating_add(T::DbWeight::get().reads(5))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Alliance Members (r:2 w:2)
	// Storage: AllianceMotion Members (r:1 w:1)
	/// The range of component `m` is `[1, 100]`.
	/// The range of component `z` is `[0, 100]`.
	fn init_members(m: u32, z: u32, ) -> Weight {
		// Minimum execution time: 37_013 nanoseconds.
		Weight::from_ref_time(25_692_069)
			// Standard Error: 812
			.saturating_add(Weight::from_ref_time(134_488).saturating_mul(m.into()))
			// Standard Error: 803
			.saturating_add(Weight::from_ref_time(118_421).saturating_mul(z.into()))
			.saturating_add(T::DbWeight::get().reads(3))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Alliance Members (r:2 w:2)
	// Storage: AllianceMotion Proposals (r:1 w:0)
	// Storage: Alliance DepositOf (r:101 w:50)
	// Storage: System Account (r:50 w:50)
	// Storage: AllianceMotion Members (r:0 w:1)
	// Storage: AllianceMotion Prime (r:0 w:1)
	/// The range of component `x` is `[1, 100]`.
	/// The range of component `y` is `[0, 100]`.
	/// The range of component `z` is `[0, 50]`.
	fn disband(x: u32, y: u32, z: u32, ) -> Weight {
		// Minimum execution time: 219_862 nanoseconds.
		Weight::from_ref_time(220_712_000)
			// Standard Error: 18_567
			.saturating_add(Weight::from_ref_time(433_653).saturating_mul(x.into()))
			// Standard Error: 18_478
			.saturating_add(Weight::from_ref_time(431_646).saturating_mul(y.into()))
			// Standard Error: 36_923
			.saturating_add(Weight::from_ref_time(8_847_906).saturating_mul(z.into()))
			.saturating_add(T::DbWeight::get().reads(3))
			.saturating_add(T::DbWeight::get().reads((1_u64).saturating_mul(x.into())))
			.saturating_add(T::DbWeight::get().reads((1_u64).saturating_mul(y.into())))
			.saturating_add(T::DbWeight::get().reads((1_u64).saturating_mul(z.into())))
			.saturating_add(T::DbWeight::get().writes(4))
			.saturating_add(T::DbWeight::get().writes((2_u64).saturating_mul(z.into())))
	}
	// Storage: Alliance Rule (r:0 w:1)
	fn set_rule() -> Weight {
		// Minimum execution time: 15_999 nanoseconds.
		Weight::from_ref_time(16_305_000)
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Alliance Announcements (r:1 w:1)
	fn announce() -> Weight {
		// Minimum execution time: 17_807 nanoseconds.
		Weight::from_ref_time(18_087_000)
			.saturating_add(T::DbWeight::get().reads(1))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Alliance Announcements (r:1 w:1)
	fn remove_announcement() -> Weight {
		// Minimum execution time: 19_705 nanoseconds.
		Weight::from_ref_time(20_201_000)
			.saturating_add(T::DbWeight::get().reads(1))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Alliance Members (r:3 w:1)
	// Storage: Alliance UnscrupulousAccounts (r:1 w:0)
	// Storage: System Account (r:1 w:1)
	// Storage: Alliance DepositOf (r:0 w:1)
	fn join_alliance() -> Weight {
		// Minimum execution time: 46_478 nanoseconds.
		Weight::from_ref_time(47_034_000)
			.saturating_add(T::DbWeight::get().reads(5))
			.saturating_add(T::DbWeight::get().writes(3))
	}
	// Storage: Alliance Members (r:3 w:1)
	// Storage: Alliance UnscrupulousAccounts (r:1 w:0)
	fn nominate_ally() -> Weight {
		// Minimum execution time: 33_865 nanoseconds.
		Weight::from_ref_time(34_561_000)
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(1))
	}
	// Storage: Alliance Members (r:2 w:2)
	// Storage: AllianceMotion Proposals (r:1 w:0)
	// Storage: AllianceMotion Members (r:0 w:1)
	// Storage: AllianceMotion Prime (r:0 w:1)
	fn elevate_ally() -> Weight {
		// Minimum execution time: 28_970 nanoseconds.
		Weight::from_ref_time(29_650_000)
			.saturating_add(T::DbWeight::get().reads(3))
			.saturating_add(T::DbWeight::get().writes(4))
	}
	// Storage: Alliance Members (r:4 w:2)
	// Storage: AllianceMotion Proposals (r:1 w:0)
	// Storage: AllianceMotion Members (r:0 w:1)
	// Storage: AllianceMotion Prime (r:0 w:1)
	// Storage: Alliance RetiringMembers (r:0 w:1)
	fn give_retirement_notice() -> Weight {
		// Minimum execution time: 37_454 nanoseconds.
		Weight::from_ref_time(37_930_000)
			.saturating_add(T::DbWeight::get().reads(5))
			.saturating_add(T::DbWeight::get().writes(5))
	}
	// Storage: Alliance RetiringMembers (r:1 w:1)
	// Storage: Alliance Members (r:1 w:1)
	// Storage: Alliance DepositOf (r:1 w:1)
	// Storage: System Account (r:1 w:1)
	fn retire() -> Weight {
		// Minimum execution time: 39_532 nanoseconds.
		Weight::from_ref_time(40_082_000)
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(4))
	}
	// Storage: Alliance Members (r:3 w:1)
	// Storage: AllianceMotion Proposals (r:1 w:0)
	// Storage: Alliance DepositOf (r:1 w:1)
	// Storage: System Account (r:2 w:2)
	// Storage: ParachainInfo ParachainId (r:1 w:0)
	// Storage: PolkadotXcm SupportedVersion (r:1 w:0)
	// Storage: PolkadotXcm VersionDiscoveryQueue (r:1 w:1)
	// Storage: PolkadotXcm SafeXcmVersion (r:1 w:0)
	// Storage: ParachainSystem HostConfiguration (r:1 w:0)
	// Storage: ParachainSystem PendingUpwardMessages (r:1 w:1)
	// Storage: AllianceMotion Members (r:0 w:1)
	// Storage: AllianceMotion Prime (r:0 w:1)
	fn kick_member() -> Weight {
		// Minimum execution time: 115_474 nanoseconds.
		Weight::from_ref_time(118_498_000)
			.saturating_add(T::DbWeight::get().reads(13))
			.saturating_add(T::DbWeight::get().writes(8))
	}
	// Storage: Alliance UnscrupulousAccounts (r:1 w:1)
	// Storage: Alliance UnscrupulousWebsites (r:1 w:1)
	/// The range of component `n` is `[0, 100]`.
	/// The range of component `l` is `[0, 255]`.
	fn add_unscrupulous_items(n: u32, l: u32, ) -> Weight {
		// Minimum execution time: 14_398 nanoseconds.
		Weight::from_ref_time(14_697_000)
			// Standard Error: 3_698
			.saturating_add(Weight::from_ref_time(1_198_889).saturating_mul(n.into()))
			// Standard Error: 1_448
			.saturating_add(Weight::from_ref_time(79_776).saturating_mul(l.into()))
			.saturating_add(T::DbWeight::get().reads(2))
			.saturating_add(T::DbWeight::get().writes(2))
	}
	// Storage: Alliance UnscrupulousAccounts (r:1 w:1)
	// Storage: Alliance UnscrupulousWebsites (r:1 w:1)
	/// The range of component `n` is `[0, 100]`.
	/// The range of component `l` is `[0, 255]`.
	fn remove_unscrupulous_items(n: u32, l: u32, ) -> Weight {
		// Minimum execution time: 15_004 nanoseconds.
		Weight::from_ref_time(15_120_000)
			// Standard Error: 189_857
			.saturating_add(Weight::from_ref_time(14_119_764).saturating_mul(n.into()))
			// Standard Error: 74_356
			.saturating_add(Weight::from_ref_time(562_057).saturating_mul(l.into()))
			.saturating_add(T::DbWeight::get().reads(2))
			.saturating_add(T::DbWeight::get().writes(2))
	}
	// Storage: Alliance Members (r:3 w:2)
	// Storage: AllianceMotion Proposals (r:1 w:0)
	// Storage: AllianceMotion Members (r:0 w:1)
	// Storage: AllianceMotion Prime (r:0 w:1)
	fn abdicate_fellow_status() -> Weight {
		// Minimum execution time: 35_300 nanoseconds.
		Weight::from_ref_time(36_226_000)
			.saturating_add(T::DbWeight::get().reads(4))
			.saturating_add(T::DbWeight::get().writes(4))
	}
}