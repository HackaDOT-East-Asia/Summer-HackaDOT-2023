import Keyring from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { Provider } from '../../provider'
import { localNetworkUtils } from '../local-network/local-network-utils'

const main = async () => {
  const relayRpc = localNetworkUtils.parachain2Rpc

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromUri('//Alice')

  const relayProvider = new Provider(relayRpc, sender)

  const body = {
    assetId: 1, // local asset id
    assetMultiLocation: {
      parents: 1,
      interior: {
        X3: [
          {
            Parachain: 1000,
          },
          {
            PalletInstance: 50,
          },
          {
            GeneralIndex: 1,
          },
        ],
      },
    },
  }

  const res = await relayProvider.customExtrinsic({
    asSudo: true,
    pallet: 'assetRegistry',
    method: 'registerReserveAsset',
    body,
  })
  console.log(res)
}

main().then(() => process.exit(1))

/**
npx ts-node src/examples/custom-extrinsic/mark-asset-as-multilocation.ts
*/
