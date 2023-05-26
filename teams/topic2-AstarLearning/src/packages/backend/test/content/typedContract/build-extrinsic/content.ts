/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { GasLimit, GasLimitAndRequiredValue } from '@727-ventures/typechain-types';
import { buildSubmittableExtrinsic } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/content';
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
	 * getContent
	 *
	 * @param { (number | string | BN) } id,
	*/
	"getContent" (
		id: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getContent", [id], __options);
	}

	/**
	 * getContents
	 *
	*/
	"getContents" (
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getContents", [], __options);
	}

	/**
	 * createContent
	 *
	 * @param { string } title,
	 * @param { string } intro,
	 * @param { string } content,
	 * @param { Array<string> } quizs,
	 * @param { (number | string | BN) } answer,
	 * @param { string } url,
	 * @param { string } nft,
	 * @param { string } creator,
	*/
	"createContent" (
		title: string,
		intro: string,
		content: string,
		quizs: Array<string>,
		answer: (number | string | BN),
		url: string,
		nft: string,
		creator: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "createContent", [title, intro, content, quizs, answer, url, nft, creator], __options);
	}

	/**
	 * setImageUrl
	 *
	 * @param { (number | string | BN) } id,
	 * @param { string } newUrl,
	*/
	"setImageUrl" (
		id: (number | string | BN),
		newUrl: string,
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "setImageUrl", [id, newUrl], __options);
	}

	/**
	 * getImageUrl
	 *
	 * @param { (number | string | BN) } id,
	*/
	"getImageUrl" (
		id: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getImageUrl", [id], __options);
	}

	/**
	 * getIntro
	 *
	 * @param { (number | string | BN) } id,
	*/
	"getIntro" (
		id: (number | string | BN),
		__options: GasLimit,
	){
		return buildSubmittableExtrinsic( this.__apiPromise, this.__nativeContract, "getIntro", [id], __options);
	}

}