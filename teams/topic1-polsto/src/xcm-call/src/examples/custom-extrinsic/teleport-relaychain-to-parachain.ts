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
        parents: 0,
        interior: {
          X1: {
            Parachain: 1000,
          },
        },
      },
    },
    beneficiary: {
      V1: {
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              network: 'Any',
              id: u8aToHex(decodeAddress('5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F')),
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
              parents: 0,
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

  // const body = [
  //   {
  //     V1: {
  //       parents: 0,
  //       interior: {
  //         X1: {
  //           Parachain: 1000,
  //         },
  //       },
  //     },
  //   },
  //   {
  //     V1: {
  //       parents: 0,
  //       interior: {
  //         X1: {
  //           AccountId32: {
  //             network: 'Any',
  //             id: u8aToHex(decodeAddress('5EsQwm2F3KMejFMzSNR2N74jEm8WhHAxunitRQ4bn66wea6F')),
  //           },
  //         },
  //       },
  //     },
  //   },
  //   {
  //     V1: [
  //       {
  //         id: {
  //           Concrete: {
  //             parents: 0,
  //             interior: 'Here',
  //           },
  //         },
  //         fun: {
  //           Fungible: 100000000000,
  //         },
  //       },
  //     ],
  //   },
  //   0,
  //   'Unlimited',
  // ]

  const res = await provider.customExtrinsic({
    pallet: 'xcmPallet',
    method: 'limitedTeleportAssets',
    body,
  })
  console.log(res)
}

main().then(() => process.exit(1))

/**
npx ts-node src/examples/custom-extrinsic/teleport-relaychain-to-parachain.ts */
