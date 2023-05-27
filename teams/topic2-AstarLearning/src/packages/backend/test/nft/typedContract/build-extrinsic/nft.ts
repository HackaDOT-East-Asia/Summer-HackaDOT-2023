/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { GasLimit, GasLimitAndRequiredValue } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/nft';
import type BN from 'bn.js';
import type { ApiPromise } from '@polkadot/api';



export default class Methods {
	private __nativeContract : ContractPromise;
	private __apiPromise: ApiPromise;

	constructor(
		nativeContract : ContractPromise,
		apiPromise: ApiPromise,
	) {
		this.__nativeContract = nativeContract;
		this.__apiPromise = apiPromise;
	}
	/**
	 * mintNft
	 *
	*/
	"mintNft" (
		__options: GasLimitAndRequiredValue,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "mintNft", [], __options);
	}

	/**
	 * setBaseUri
	 *
	 * @param { string } uri,
	*/
	"setBaseUri" (
		uri: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setBaseUri", [uri], __options);
	}

	/**
	 * setNftName
	 *
	 * @param { string } name,
	*/
	"setNftName" (
		name: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setNftName", [name], __options);
	}

	/**
	 * setNftSymbol
	 *
	 * @param { string } symbol,
	*/
	"setNftSymbol" (
		symbol: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setNftSymbol", [symbol], __options);
	}

	/**
	 * setNftIamge
	 *
	 * @param { string } image,
	*/
	"setNftIamge" (
		image: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setNftIamge", [image], __options);
	}

	/**
	 * setNftDescription
	 *
	 * @param { string } description,
	*/
	"setNftDescription" (
		description: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setNftDescription", [description], __options);
	}

	/**
	 * tokenUri
	 *
	 * @param { (number | string | BN) } tokenId,
	*/
	"tokenUri" (
		tokenId: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "tokenUri", [tokenId], __options);
	}

	/**
	 * withdraw
	 *
	*/
	"withdraw" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "withdraw", [], __options);
	}

	/**
	 * maxSupply
	 *
	*/
	"maxSupply" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "maxSupply", [], __options);
	}

	/**
	 * checkAmount
	 *
	 * @param { (number | string | BN) } mintAmount,
	*/
	"checkAmount" (
		mintAmount: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "checkAmount", [mintAmount], __options);
	}

	/**
	 * tokenExists
	 *
	 * @param { ArgumentTypes.Id } id,
	*/
	"tokenExists" (
		id: ArgumentTypes.Id,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "tokenExists", [id], __options);
	}

	/**
	 * getNftName
	 *
	*/
	"getNftName" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getNftName", [], __options);
	}

	/**
	 * getNftSymbol
	 *
	*/
	"getNftSymbol" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getNftSymbol", [], __options);
	}

	/**
	 * getOwnNfts
	 *
	*/
	"getOwnNfts" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getOwnNfts", [], __options);
	}

	/**
	 * getIamge
	 *
	*/
	"getIamge" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getIamge", [], __options);
	}

	/**
	 * getNftDescription
	 *
	*/
	"getNftDescription" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getNftDescription", [], __options);
	}

}