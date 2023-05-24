/* This file is auto-generated */

import type { ContractPromise } from '@polkadot/api-contract';
import type { ApiPromise } from '@polkadot/api';
import type { GasLimit, GasLimitAndRequiredValue, Result } from '@727-ventures/typechain-types';
import type { QueryReturnType } from '@727-ventures/typechain-types';
import { queryJSON, queryOkJSON, handleReturnType } from '@727-ventures/typechain-types';
import type * as ArgumentTypes from '../types-arguments/content';
import type * as ReturnTypes from '../types-returns/content';
import type BN from 'bn.js';
//@ts-ignore
import {ReturnNumber} from '@727-ventures/typechain-types';
import {getTypeDescription} from './../shared/utils';
import DATA_TYPE_DESCRIPTIONS from '../data/content.json';


export default class Methods {
	private __nativeContract : ContractPromise;
	private __apiPromise: ApiPromise;
	private __callerAddress : string;

	constructor(
		nativeContract : ContractPromise,
		nativeApi : ApiPromise,
		callerAddress : string,
	) {
		this.__nativeContract = nativeContract;
		this.__callerAddress = callerAddress;
		this.__apiPromise = nativeApi;
	}

	/**
	* getContent
	*
	* @param { (number | string | BN) } id,
	* @returns { Result<ReturnTypes.ContentInfo, ReturnTypes.LangError> }
	*/
	"getContent" (
		id: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<ReturnTypes.ContentInfo, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "getContent", [id], __options , (result) => { return handleReturnType(result, getTypeDescription(7, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* getContents
	*
	* @returns { Result<Array<ReturnTypes.ContentInfo>, ReturnTypes.LangError> }
	*/
	"getContents" (
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Array<ReturnTypes.ContentInfo>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "getContents", [], __options , (result) => { return handleReturnType(result, getTypeDescription(9, DATA_TYPE_DESCRIPTIONS)); });
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
	* @returns { Result<Result<null, null>, ReturnTypes.LangError> }
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
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, null>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "createContent", [title, intro, content, quizs, answer, url, nft, creator], __options , (result) => { return handleReturnType(result, getTypeDescription(11, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* setImageUrl
	*
	* @param { (number | string | BN) } id,
	* @param { string } newUrl,
	* @returns { Result<Result<null, null>, ReturnTypes.LangError> }
	*/
	"setImageUrl" (
		id: (number | string | BN),
		newUrl: string,
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<Result<null, null>, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "setImageUrl", [id, newUrl], __options , (result) => { return handleReturnType(result, getTypeDescription(11, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* getImageUrl
	*
	* @param { (number | string | BN) } id,
	* @returns { Result<string, ReturnTypes.LangError> }
	*/
	"getImageUrl" (
		id: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<string, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "getImageUrl", [id], __options , (result) => { return handleReturnType(result, getTypeDescription(13, DATA_TYPE_DESCRIPTIONS)); });
	}

	/**
	* getIntro
	*
	* @param { (number | string | BN) } id,
	* @returns { Result<string, ReturnTypes.LangError> }
	*/
	"getIntro" (
		id: (number | string | BN),
		__options ? : GasLimit,
	): Promise< QueryReturnType< Result<string, ReturnTypes.LangError> > >{
		return queryOkJSON( this.__apiPromise, this.__nativeContract, this.__callerAddress, "getIntro", [id], __options , (result) => { return handleReturnType(result, getTypeDescription(13, DATA_TYPE_DESCRIPTIONS)); });
	}

}