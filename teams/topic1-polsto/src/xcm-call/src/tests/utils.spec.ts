import { expect, assert } from 'chai'
import { objectBody, arrayBody } from './mocks/utils-mocks'
import { getPallet, parseGenericBody } from '../utils'

describe('Utils', () => {
  describe('getPallet', () => {
    it('should return xcmPallet', () => {
      const mockApi = {
        tx: { xcmPallet: { reserveTransferAssets: () => null } },
      } as any

      const pallet = getPallet(mockApi)

      expect(pallet).to.equal('xcmPallet')
    })

    it('should return polkadotXcm', () => {
      const mockApi = {
        tx: { polkadotXcm: { reserveTransferAssets: () => null } },
      } as any
      const pallet = getPallet(mockApi)

      expect(pallet).to.equal('polkadotXcm')
    })

    it('should return error', () => {
      const mockApi = {
        tx: { xTokens: { transfer: () => null } },
      } as any

      try {
        getPallet(mockApi)
        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: xcmPallet or polkadotXcm unsupported')
      }
    })

    it('should return custom pallet (xTokens)', () => {
      const mockApi = {
        tx: { xTokens: { transfer: () => null } },
      } as any

      const pallet = getPallet(mockApi, 'xTokens')

      expect(pallet).to.equal('xTokens')
    })

    it('should return unsupported custom pallet (xTokens)', () => {
      const mockApi = {
        tx: { xcmPallet: { send: () => null } },
      } as any

      try {
        getPallet(mockApi, 'xTokens')

        assert.fail('actual', 'expected', "It shouldn't work ")
      } catch (error) {
        expect(String(error)).to.equal('Error: xTokens unsupported')
      }
    })
  })

  describe('parseBody', () => {
    it('should return object body as an array', () => {
      const array = parseGenericBody(objectBody)

      expect(array[0]).to.equal(objectBody['assetId'])
      expect(array[1]).to.equal(objectBody['assetMultiLocation'])
    })

    it('should return array body as an array', () => {
      const array = parseGenericBody(arrayBody)

      expect(array).to.equal(arrayBody)
    })
  })
})
