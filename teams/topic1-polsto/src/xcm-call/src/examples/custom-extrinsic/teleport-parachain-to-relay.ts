import Keyring from '@polkadot/keyring'
import { u8aToHex } from '@polkadot/util'
import { cryptoWaitReady, decodeAddress } from '@polkadot/util-crypto'
import { Provider } from '../../provider'
import { rococoExampleUtils } from '../rococo/rococo-examples-utils'

const main = async () => {
  const rpc = rococoExampleUtils.rococoRpc

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromMnemonic(rococoExampleUtils.senderMnemonic)

  const provider = new Provider(rpc, sender)

  const body = {
    dest: {
      V1: {
        parents: 1,
        interior: 'Here',
      },
    },
    beneficiary: {
      V1: {
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              network: 'Any',
              id: u8aToHex(decodeAddress(rococoExampleUtils.rococoDestinationAccount)),
            },
          },
        },
      },
    },
    assets: {
      V1: [
        {
          id: {
            Concrete: {
              parents: 1,
              interior: 'Here',
            },
          },
          fun: {
            Fungible: 100000000000,
          },
        },
      ],
    },
    feeAssetItem: 0,
    weightLimit: 'Unlimited',
  }

  const res = await provider.customExtrinsic({
    pallet: 'xcmPallet',
    method: 'limitedTeleportAssets',
    body,
  })
  console.log(res)
}

main().then(() => process.exit(1))

/**
npx ts-node src/examples/custom-extrinsic/teleport-parachain-to-relay.ts
*/
