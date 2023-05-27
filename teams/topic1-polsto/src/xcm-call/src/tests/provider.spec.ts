import { ApiPromise, WsProvider } from '@polkadot/api'
import * as Keyring from '@polkadot/keyring'
import { assert, expect } from 'chai'
import sinon from 'sinon'
import {
  chainSpecsMock,
  genericBodyMock,
  injectorMock,
  SIGNER_MOCK,
  xcmPalletMock,
  XCM_PALLET_RESPONSES,
} from './mocks/provider-mocks'
import { Provider } from '../provider'

describe('Provider', () => {
  beforeEach(() => {
    sinon.stub(Keyring, 'default').returns({
      addFromMnemonic: () => SIGNER_MOCK,
    })

    sinon.stub(WsProvider.prototype, 'connect').resolves()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should instance', () => {
    const keyring = new Keyring.default({ type: 'sr25519' })
    const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

    const provider = new Provider(chainSpecsMock.rpc, sender)

    expect(provider.rpc).to.equal(chainSpecsMock.rpc)
    expect(provider.signer).to.equal(SIGNER_MOCK)
  })

  it('should save inject signer', () => {
    const rpc = chainSpecsMock.rpc
    const accountId = '0x12345'

    const provider = new Provider(rpc, accountId)
    provider.setInjectorSigner(injectorMock.signer as any)

    expect(JSON.stringify(provider.injectorSigner)).to.equal(JSON.stringify(injectorMock.signer))
  })

  describe('limited teleport assets', () => {
    it('should send teleport asset from relaychain to parachain', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            limitedTeleportAssets: xcmPalletMock.limitedTeleportAssets,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      const res = await provider.limitedTeleportAssets({
        destination,
        destinationValue,
        beneficiary,
        beneficiaryValue,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.limitedTeleportAssets)
    })

    it('should send teleport asset from relaychain to parachain with injector', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            limitedTeleportAssets: xcmPalletMock.limitedTeleportAssets,
          },
        },
        setSigner: () => null,
      } as any)

      const sender = '0x12345'

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      provider.setInjectorSigner(injectorMock.signer as any)

      const res = await provider.limitedTeleportAssets({
        destination,
        destinationValue,
        beneficiary,
        beneficiaryValue,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.limitedTeleportAssets)
    })

    it('should send teleport asset from parachain to relaychain', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            limitedTeleportAssets: xcmPalletMock.limitedTeleportAssets,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.parachainRpc
      const destinationParents = 1
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.relayAccount
      const assetParents = 1
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      const res = await provider.limitedTeleportAssets({
        destinationParents,
        beneficiary,
        beneficiaryValue,
        assetParents,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.limitedTeleportAssets)
    })

    it('should send teleport asset from parachain to relaychain account native format', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            limitedTeleportAssets: xcmPalletMock.limitedTeleportAssets,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.parachainRpc
      const destinationParents = 1
      const beneficiary = 'AccountId32'
      const beneficiaryValue = 'FtyTjdPJkMFnF9UjQ1g6owwRGsmMGGF11FSZnq84P3yYKRD'
      const assetParents = 1
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      const res = await provider.limitedTeleportAssets({
        destinationParents,
        beneficiary,
        beneficiaryValue,
        assetParents,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.limitedTeleportAssets)
    })

    it('should show error after send tx', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            limitedTeleportAssets: xcmPalletMock.limitedTeleportAssetsWithError,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.parachainRpc
      const destinationParents = 1
      const beneficiary = 'AccountId32'
      const beneficiaryValue = 'FtyTjdPJkMFnF9UjQ1g6owwRGsmMGGF11FSZnq84P3yYKRD'
      const assetParents = 1
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      try {
        await provider.limitedTeleportAssets({
          destinationParents,
          beneficiary,
          beneficiaryValue,
          assetParents,
          amount,
        })
        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(error).to.equal('tx error')
      }
    })

    it('should show error', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {},
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.parachainRpc
      const destinationParents = 1
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.relayAccount
      const assetParents = 1
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      try {
        await provider.limitedTeleportAssets({
          destinationParents,
          beneficiary,
          beneficiaryValue,
          assetParents,
          amount,
        })
        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: No limitedTeleportAssets method found')
      }
    })
  })

  describe('teleport assets', () => {
    it('should send asset from relaychain to parachain', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            teleportAssets: xcmPalletMock.teleportAssets,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      const res = await provider.teleportAssets({
        destination,
        destinationValue,
        beneficiary,
        beneficiaryValue,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.teleportAssets)
    })

    it('should show error', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {},
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      try {
        await provider.teleportAssets({
          destination,
          destinationValue,
          beneficiary,
          beneficiaryValue,
          amount,
        })
        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: No teleportAssets method found')
      }
    })
  })

  describe('limited reserve transfer assets', () => {
    it('should transfer asset from relaychain to parachain', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            limitedReserveTransferAssets: xcmPalletMock.limitedReserveTransferAssets,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      const res = await provider.limitedReserveTransferAssets({
        destination,
        destinationValue,
        beneficiary,
        beneficiaryValue,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.limitedReserveTransferAssets)
    })

    it('should show error', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {},
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      try {
        await provider.limitedReserveTransferAssets({
          destination,
          destinationValue,
          beneficiary,
          beneficiaryValue,
          amount,
        })

        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: No limitedReserveTransferAssets method found')
      }
    })
  })

  describe('reserve transfer assets', () => {
    it('should transfer asset from relaychain to parachain', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            reserveTransferAssets: xcmPalletMock.reserveTransferAssets,
          },
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      const res = await provider.reserveTransferAssets({
        destination,
        destinationValue,
        beneficiary,
        beneficiaryValue,
        amount,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.reserveTransferAssets)
    })

    it('should show error', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {},
        },
      } as any)

      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)

      const rpc = chainSpecsMock.rpc
      const destination = 'Parachain'
      const destinationValue = chainSpecsMock.parachainId
      const beneficiary = 'AccountId32'
      const beneficiaryValue = chainSpecsMock.parachainAccount
      const amount = 50000000000

      const provider = new Provider(rpc, sender)

      try {
        await provider.reserveTransferAssets({
          destination,
          destinationValue,
          beneficiary,
          beneficiaryValue,
          amount,
        })
        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: No reserveTransferAssets method found')
      }
    })
  })

  describe('generic extrinsic', () => {
    it('should call xcmPallet and reserveTransferAssets method', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xcmPallet: {
            reserveTransferAssets: xcmPalletMock.reserveTransferAssets,
          },
        },
      } as any)
      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)
      const rpc = chainSpecsMock.rpc
      const provider = new Provider(rpc, sender)

      const res = await provider.customExtrinsic({
        pallet: 'xcmPallet',
        method: 'reserveTransferAssets',
        body: genericBodyMock,
      })
      expect(res).to.equal(XCM_PALLET_RESPONSES.reserveTransferAssets)
    })

    it('should show error', async () => {
      sinon.stub(ApiPromise, 'create').returns({
        tx: {
          xTokens: {
            transfer: () => null,
          },
        },
      } as any)
      const keyring = new Keyring.default({ type: 'sr25519' })
      const sender = keyring.addFromMnemonic(chainSpecsMock.senderMnemonic)
      const rpc = chainSpecsMock.rpc
      const provider = new Provider(rpc, sender)

      try {
        await provider.customExtrinsic({
          pallet: 'xTokens',
          method: 'reserveTransferAssets',
          body: genericBodyMock,
        })
        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: reserveTransferAssets method unsupported')
      }
    })
  })
})
