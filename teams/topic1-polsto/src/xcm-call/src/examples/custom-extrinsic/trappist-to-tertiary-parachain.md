Custom Extrinsic examples
=======

This is a tutorial to use the execute method from polkadotXcm pallet to reserve transfer asset from trappist to a tertiary parachain running in a local network.

First, you need to setup a <a href="../local-network/readme.md"> local-network </a>, make sure you already <a href="../local-network/readme.md#config-assets">configured the assets</a>. Then mint some asset to Alice in statamine and <a href="../local-network/readme.md#transfer-xusd-from-statemine-to-txusd-on-trappist"> reserve transfer some xUSD from statemine to trappist </a>.

To reserve transfer txUSD to pxUSD on tertiary parachain (parachain with id 3000 in local node):

command:
```sh
npx ts-node src/examples/custom-extrinsic/reserve-transfer-from-trappist-parachain-to-tertiary-parachain.ts
```

or manually:
```ts
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
                                id: u8aToHex(decodeAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')), // alice account address
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

  const res = await provider.customExtrinsic({
    pallet: 'polkadotXcm',
    method: 'execute',
    body,
  })
```

This method takes a few minutes to complete, it goes from trappist to statemine and then to the parachain with id 3000. You should see the events in each parachain in polkadotjs.

events in trappist (origin):

![](../../../.images/custom-extrinsic/trappist.png)


events in statemine:

![](../../../.images/custom-extrinsic/statemine.png)

events in tertiary parachain (target):

![](../../../.images/custom-extrinsic/tertiary.png)

assets transfered in parachain 3000 (pxUSD):

![](../../../.images/custom-extrinsic/pxUSD-transfered.png)

This example was made following <a href="https://youtu.be/UfxU3hUprKo?t=1760">this video</a> and <a href="https://github.com/paritytech/trappist/blob/master/xcm-simulator/src/tests/xcm_use_cases.rs#L224-L358">this example</a>.
