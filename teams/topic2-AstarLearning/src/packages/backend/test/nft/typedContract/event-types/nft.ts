import type {ReturnNumber} from "@727-ventures/typechain-types";
import type * as ReturnTypes from '../types-returns/nft';

export interface Transfer {
	from: ReturnTypes.AccountId | null;
	to: ReturnTypes.AccountId | null;
	id: ReturnTypes.Id;
}

export interface Approval {
	from: ReturnTypes.AccountId;
	to: ReturnTypes.AccountId;
	id: ReturnTypes.Id | null;
	approved: boolean;
}

