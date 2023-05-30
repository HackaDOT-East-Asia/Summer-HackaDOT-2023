import type { NextPage } from 'next';
import { useState, useCallback, useEffect } from 'react';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { Abi, ContractPromise } from '@polkadot/api-contract';
import { options } from '@astar-network/astar-api';
import type { WeightV2 } from '@polkadot/types/interfaces';
import { BN } from '@polkadot/util';

import Head from 'next/head';
import styles from '../styles/Home.module.css';
import abiData from '../constant/abi';
import { RPS_CONTRACT_ADDRESS } from '../constant/address';

// local
const WS_PROVIDER = 'ws://127.0.0.1:9944';

// shibuya
// const WS_PROVIDER = 'wss://shibuya-rpc.dwellir.com'

const proofSize = 131072;
const refTime = 6219235328;
const storageDepositLimit = null;

const address = RPS_CONTRACT_ADDRESS;

const query = async (api: ApiPromise, contract: ContractPromise) => {
  const gasLimit: any = api.registry.createType('WeightV2', {
    refTime: new BN('10000000000'),
    proofSize: new BN('10000000000'),
  });

  const { gasRequired, result, output } = await contract.query.balanceOf(
    address,
    {
      gasLimit,
      storageDepositLimit,
    },
    address
  );

  console.log(result.toHuman());
  console.log(gasRequired.toHuman());

  if (result.isOk) {
    console.log('Success', output?.toHuman());

    if (output) {
      return output?.toString();
    }
  } else {
    console.error('Error', result.asErr);
  }
};

const read = async () => {
  const provider = new WsProvider(WS_PROVIDER);
  const api = new ApiPromise(options({ provider }));

  await api.isReady;

  const abi = new Abi(abiData, api.registry.getChainProperties());

  const contract = new ContractPromise(api, abi, address);

  await query(api, contract);
};

const flip = async (account: any, signer: any) => {
  const provider = new WsProvider(WS_PROVIDER);
  const api = new ApiPromise(options({ provider }));

  await api.isReady;

  api.setSigner(signer);

  console.log('API is ready');

  const abi = new Abi(abiData, api.registry.getChainProperties());

  const contract = new ContractPromise(api, abi, address);

  const { gasRequired, result, output } = await contract.query.flip(address, {
    gasLimit: api.registry.createType('WeightV2', {
      refTime,
      proofSize,
    }) as WeightV2,
    storageDepositLimit,
  });

  const gasLimit = api.registry.createType('WeightV2', gasRequired) as WeightV2;

  // Send the transaction, like elsewhere this is a normal extrinsic
  // with the same rules as applied in the API (As with the read example,
  // additional params, if required can follow)
  try {
    await contract.tx
      .flip({
        gasLimit: gasLimit,
        storageDepositLimit,
      })
      .signAndSend(account, async (res: any) => {
        if (res.status.isInBlock) {
          console.log('in a block');
        } else if (res.status.isFinalized) {
          console.log('finalized');
        }
      });

    await query(api, contract);
  } catch (e) {
    console.error(e);
  }
};
