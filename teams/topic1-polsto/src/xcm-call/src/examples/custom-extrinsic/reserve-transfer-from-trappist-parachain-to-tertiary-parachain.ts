import Keyring from '@polkadot/keyring'
import { u8aToHex } from '@polkadot/util'
import { cryptoWaitReady, decodeAddress } from '@polkadot/util-crypto'
import { Provider } from '../../provider'
import { localNetworkUtils } from '../local-network/local-network-utils'

const main = async () => {
  const trappistRpc = localNetworkUtils.parachain2Rpc

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromUri('//Alice')

  const trappistProvider = new Provider(trappistRpc, sender)

  const body = {
    message: {
      V2: [
        {
          WithdrawAsset: [
            {
              id: {
                Concrete: {
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
              },
              fun: {
                Fungible: 5_000_000_000_000, // amount to transfer: 5 txUSD
              },
            },
          ],
        },
        {
          InitiateReserveWithdraw: {
            assets: {
              Wild: 'All',
            },
            reserve: {
              parents: 1,
              interior: {
                X1: {
                  Parachain: 1000,
                },
              },
            },
            xcm: [
              {
                BuyExecution: {
                  fees: {
                    id: {
                      Concrete: {
                        parents: 0,
                        interior: {
                          X2: [
                            {
                              PalletInstance: 50,
                            },
                            {
                              GeneralIndex: 1,
                            },
                          ],
                        },
                      },
                    },
                    fun: {
                      Fungible: 1_000_000_000_000,
                    },
                  },
                  weightLimit: 'Unlimited',
                },
              },

              {
                DepositReserveAsset: {
                  assets: {
                    Wild: 'All',
                  },
                  maxAssets: 1,
                  dest: {
                    parents: 1,
                    interior: {
                      X1: {
                        Parachain: 3000,
                      },
                    },
                  },
                  xcm: [
                    {
                      DepositAsset: {
                        assets: {
                          Wild: 'All',
                        },
                        maxAssets: 1,
                        beneficiary: {
                          parents: 0,
                          interior: {
                            X1: {
                              AccountId32: {
                                network: 'Any',
                                id: u8aToHex(decodeAddress(localNetworkUtils.parachain3AliceAccount)),
                              },
                            },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
    maxWeight: 10_000_000_000,
  }

  const res = await trappistProvider.customExtrinsic({
    pallet: 'polkadotXcm',
    method: 'execute',
    body,
  })
  console.log(res)
}

main().then(() => process.exit(1))

/**
npx ts-node src/examples/custom-extrinsic/reserve-transfer-from-trappist-parachain-to-tertiary-parachain.ts
*/
