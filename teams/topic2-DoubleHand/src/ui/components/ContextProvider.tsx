import { web3Enable, isWeb3Injected, web3Accounts } from '@polkadot/extension-dapp';
import { useState, useCallback } from 'react';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { options } from '@astar-network/astar-api';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import abiData from '../constant/abi';
import { RPS_CONTRACT_ADDRESS } from '../constant/address';
import { useAsync } from 'react-use';
import { keyring as Keyring } from '@polkadot/ui-keyring';
import { KeyringPair } from '@polkadot/keyring/types';
import { SubstrateContext } from './Context';

const WS_PROVIDER = 'ws://127.0.0.1:9944';

const SubstrateContextProvider = (props: any) => {
  // load Substrate wallet and set the signer
  const [account, setAccount] = useState<KeyringPair | null>(null);
  const [accounts, setAccounts] = useState<KeyringPair[] | null>([]);
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [contract, setContract] = useState<ContractPromise | null>(null);

  useAsync(async () => {
    const provider = new WsProvider(WS_PROVIDER);
    const api = new ApiPromise(options({ provider }));
    setApi(api);

    await api.isReady;
    console.log(api.isReady);

    const abi = new Abi(abiData, api.registry.getChainProperties());
    setContract(new ContractPromise(api, abi, RPS_CONTRACT_ADDRESS));

    if (!isWeb3Injected) {
      throw new Error('The user does not have any Substrate wallet installed');
    }

    await web3Enable('RPS_1');

    // set the first wallet as the signer (we assume there is only one wallet)
    // wallet.substrate.setSigner(extensions[0].signer)

    let injectedAccounts = await web3Accounts();
    injectedAccounts = injectedAccounts.map(({ address, meta }) => ({
      address,
      meta: { ...meta, name: `${meta.name} (${meta.source})` },
    }));

    Keyring.loadAll({ isDevelopment: true }, injectedAccounts);
    const keyrings = Keyring.getPairs();
    console.log(keyrings);

    setAccounts(keyrings as KeyringPair[]);
  }, []);

  return (
    <SubstrateContext.Provider value={{ accounts, api, contract, account, setAccount: setAccount as any }}>
      {props.children}
    </SubstrateContext.Provider>
  );
};

export default SubstrateContextProvider;
