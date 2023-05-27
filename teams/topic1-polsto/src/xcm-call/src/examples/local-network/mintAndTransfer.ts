import { ApiPromise, Keyring, WsProvider } from '@polkadot/api'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { localNetworkUtils } from './local-network-utils'

const main = async () => {
  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromUri('//Alice')

  const relayProvider = await ApiPromise.create({
    provider: new WsProvider(localNetworkUtils.relayRpc),
  })

  const paraAProvider = await ApiPromise.create({
    provider: new WsProvider(localNetworkUtils.parachain1Rpc),
  })

  const paraBProvider = await ApiPromise.create({
    provider: new WsProvider(localNetworkUtils.parachain2Rpc),
  })


  console.log('creating assets...')
  const extrinsicCreateAssetParaA = paraAProvider.tx.utility.batchAll([
    paraAProvider.tx.assets.create(1, sender.address, 100000000000),
    paraAProvider.tx.assets.setMetadata(1, 'xUSD', 'xUSD', 12),
  ])

  await extrinsicCreateAssetParaA.signAndSend(sender)
  console.log('xUSD created on statemine')

  const extrinsicRelay = await relayProvider.tx.sudo.sudo(
    (relayProvider.tx as any).parasSudoWrapper.sudoQueueDownwardXcm(localNetworkUtils.parachain1ChainId, {
      V2: [
        {
          Transact: {
            originType: 'Superuser',
            requireWeightAtMost: 100000000000,
            call: {
              encoded:
                '0x32150400d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d00d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d00d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d00d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d040100',
            },
          },
        },
      ],
    }),
  )

  await extrinsicRelay.signAndSend(sender)

  console.log('setting txUSD as multilocation...')

  const extrinsicParab = await paraBProvider.tx.sudo.sudo(
    paraBProvider.tx.assetRegistry.registerReserveAsset(1, {
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
    }),
  )

  await extrinsicParab.signAndSend(sender)

  console.log('setting pxUSD as multilocation...')

  const extrinsicParaC = await paraCProvider.tx.sudo.sudo(
    paraCProvider.tx.assetRegistry.registerReserveAsset(1, {
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
    }),
  )

  await extrinsicParaC.signAndSend(sender)

  console.log('done!')
}

main().then(() => process.exit(1))

/**
npx ts-node src/examples/local-network/config-assets.ts
 */
