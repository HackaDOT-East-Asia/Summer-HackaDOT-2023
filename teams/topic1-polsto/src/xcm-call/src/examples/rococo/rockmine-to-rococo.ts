import { Keyring } from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'
import { rococoExampleUtils } from './rococo-examples-utils'
import { Provider } from '../../provider'

const main = async () => {
  const rpc = rococoExampleUtils.rockMineRpc
  const destinationParents = 1
  const beneficiary = 'AccountId32'
  const beneficiaryValue = rococoExampleUtils.rococoDestinationAccount
  const assetParents = 1
  const amount = rococoExampleUtils.rocAmount

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const sender = keyring.addFromMnemonic(rococoExampleUtils.senderMnemonic)

  const provider = new Provider(rpc, sender)

  const res = await provider.limitedTeleportAssets({
    destinationParents,
    beneficiary,
    beneficiaryValue,
    assetParents,
    amount,
  })

  console.log(res)
}

main().then(() => process.exit(1))

/**
npx ts-node src/examples/rococo/rockmine-to-rococo.ts 
 */
