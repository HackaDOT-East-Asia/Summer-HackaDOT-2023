import type BN from 'bn.js';
import type {ReturnNumber} from '@727-ventures/typechain-types';

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type ContentInfo = {
	contentId: number,
	title: string,
	intro: string,
	content: string,
	goods: number,
	quizs: Array<string>,
	answer: number,
	imageUrl: string,
	nftAddress: string,
	creatorAddress: string
}

