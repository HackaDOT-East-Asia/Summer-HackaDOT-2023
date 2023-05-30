import { Dispatch, SetStateAction } from 'react';
import { ApiPromise } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';
import { KeyringPair } from '@polkadot/keyring/types';

import { createContext, useContext } from 'react';

export const SubstrateContext = createContext(
  {} as {
    api: ApiPromise | null | undefined;
    accounts: KeyringPair[] | null | undefined;
    contract: ContractPromise | null | undefined;
    account: KeyringPair | null | undefined;
    setAccount: Dispatch<SetStateAction<KeyringPair>>;
  }
);
export const useSubstrateContext = () => useContext(SubstrateContext);
