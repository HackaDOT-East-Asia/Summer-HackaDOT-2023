import { useQuery } from 'react-query';
import { useSubstrateContext } from '../components/Context';
import BN from 'bn.js';

// const gasLimit: any = api.registry.createType('WeightV2', {
//   refTime: new BN('10000000000'),
//   proofSize: new BN('10000000000'),
// });
const storageDepositLimit = null;

export const useGameInfo = () => {
  const { contract, api } = useSubstrateContext();

  return useQuery('gameInfo', async () => {
    if (!contract || !api) return;

    const gasLimit: any = api.registry.createType('WeightV2', {
      refTime: new BN('10000000000'),
      proofSize: new BN('10000000000'),
    });

    const gameInfo = await contract.query.getGameInfo(contract.address, {
      gasLimit,
      storageDepositLimit,
    });

    const result = gameInfo.output?.toHuman();
    if (!result) return;

    // @ts-ignore
    return result.Ok;
  });
};

export const useAllMembersInfo = () => {
  const { contract, api } = useSubstrateContext();

  return useQuery('allMembersInfo', async () => {
    if (!contract || !api) return;

    const gasLimit: any = api.registry.createType('WeightV2', {
      refTime: new BN('10000000000'),
      proofSize: new BN('10000000000'),
    });

    const gameInfo = await contract.query.getAllMembersInfo(contract.address, {
      gasLimit,
      storageDepositLimit,
    });

    const result = gameInfo.output?.toHuman();
    if (!result) return;

    // @ts-ignore
    return result.Ok;
  });
};
