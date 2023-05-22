#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;
pub mod weights;

#[frame_support::pallet]
pub mod pallet {
	use crate::weights::WeightInfo;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use parity_scale_codec::HasCompact;
	use sp_runtime::traits::AtLeast32BitUnsigned;

	#[pallet::pallet]
	#[pallet::without_storage_info]
	pub struct Pallet<T>(_);

	#[derive(Default, Clone, Encode, Decode, RuntimeDebug, PartialEq, scale_info::TypeInfo)]
	#[scale_info(skip_type_params(T))]
	pub struct TokenIssuanceMeta<T: Config> {
		asset_id: T::AssetId,
		balance: T::Balance,
		limit: T::Limit,
	}

	#[pallet::config]
	pub trait Config: frame_system::Config {
		type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;
		type AssetId: Member + Parameter + Default + Copy + HasCompact + MaxEncodedLen;
		type AssetType: Parameter + Member + Ord + PartialOrd + Into<Self::AssetId> + Default;
		type Limit: Member + Parameter + AtLeast32BitUnsigned + Default + Copy + MaxEncodedLen;
		type Balance: Member + Parameter + AtLeast32BitUnsigned + Default + Copy + MaxEncodedLen;
		type WeightInfo: WeightInfo;
	}

	#[pallet::storage]
	#[pallet::getter(fn asset_id_type)]
	pub type AssetIdType<T: Config> = StorageMap<_, Blake2_128Concat, T::AssetId, T::AssetType>;

	#[pallet::storage]
	#[pallet::getter(fn asset_id_token_issuance_meta)]
	pub type AssetIdTokenIssuanceMeta<T: Config> = StorageMap<_, Blake2_128Concat, T::AssetId, TokenIssuanceMeta<T>>;

	#[pallet::error]
	pub enum Error<T> {
		AssetAlreadyExists,
		AssetDoesNotExist,
		TokenIssuanceMetaAlreadyExists,
	}

	#[pallet::event]
	#[pallet::generate_deposit(pub(crate) fn deposit_event)]
	pub enum Event<T: Config> {
		AssetRegisted {
			asset_id: T::AssetId,
			asset_type: T::AssetType,
			account_id: T::AccountId,
		},
		TokenIssuanceConfirmed {
			asset_id: T::AssetId,
			balance: T::Balance,
			limit: T::Limit,
		},
		TokenIssuanced { amount: u64, account_id: T::AccountId },
		TokenBridged { from: u64, to: u64, amount: u64 },
	}

    #[pallet::call]
	impl<T: Config> Pallet<T> {
		#[pallet::call_index(0)]
		#[pallet::weight(T::WeightInfo::register_asset())]
		pub fn register_asset(
			origin: OriginFor<T>,
			asset_type: T::AssetType
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let asset_id: T::AssetId = asset_type.clone().into();

			ensure!(
				AssetIdType::<T>::get(&asset_id).is_none(),
				Error::<T>::AssetAlreadyExists,
			);

			AssetIdType::<T>::insert(&asset_id, &asset_type);

			Self::deposit_event(Event::AssetRegisted {
				asset_id,
				asset_type,
				account_id: who,
			});

			Ok(())
		}

		#[pallet::call_index(1)]
		#[pallet::weight(T::WeightInfo::token_issuance_confirmed())]
		pub fn token_issuance_confirmed(
			origin: OriginFor<T>,
			asset_id: T::AssetId,
			balance: T::Balance,
			limit: T::Limit,
		) -> DispatchResult {
			ensure_root(origin)?;

			ensure!(
				AssetIdType::<T>::get(&asset_id).is_some(),
				Error::<T>::AssetDoesNotExist,
			);

			ensure!(
				AssetIdTokenIssuanceMeta::<T>::get(&asset_id).is_none(),
				Error::<T>::TokenIssuanceMetaAlreadyExists,
			);

			let token_issuance_meta = TokenIssuanceMeta { asset_id, balance, limit };

			AssetIdTokenIssuanceMeta::<T>::insert(&asset_id, &token_issuance_meta);

			Self::deposit_event(Event::TokenIssuanceConfirmed {
				asset_id,
				balance,
				limit,
			});

			Ok(())
		}
	}

	pub trait AssetRegistrar<T: Config> {
		fn create_asset(
			_asset: T::AssetId,
			_balance: T::Balance,
			_limit: T::Limit,
			_owner: T::AccountId,
		) -> DispatchResult {
			unimplemented!()
		}

		// How to destroy a foreign asset
		fn destroy_asset(_asset: T::AssetId) -> DispatchResult {
			unimplemented!()
		}

		// How to destroy a local asset
		fn destroy_local_asset(_asset: T::AssetId) -> DispatchResult {
			unimplemented!()
		}

		// Get destroy asset weight dispatch info
		fn destroy_asset_dispatch_info_weight(_asset: T::AssetId) -> Weight;
	}

}
