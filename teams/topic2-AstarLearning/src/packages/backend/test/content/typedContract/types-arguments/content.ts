import type BN from 'bn.js';

export enum LangError {
	couldNotReadInput = 'CouldNotReadInput'
}

export type ContentInfo = {
	contentId: (number | string | BN),
	title: string,
	intro: string,
	content: string,
	goods: (number | string | BN),
	quizs: Array<string>,
	answer: (number | string | BN),
	imageUrl: string,
	nftAddress: string,
	creatorAddress: string
}

