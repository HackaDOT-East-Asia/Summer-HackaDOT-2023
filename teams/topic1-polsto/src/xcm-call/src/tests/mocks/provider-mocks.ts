export const chainSpecsMock = {
  rpc: 'ws://localhost:40320',
  senderMnemonic: 'charmander squirtle bulbasue pikachu',
  relayAccount: '0x2222222',
  parachainId: 1000,
  parachainAccount: '0x123456789',
  parachainRpc: 'ws://localhost:41000',
}

export const SIGNER_MOCK = {
  address: '0x123',
}

export const XCM_PALLET_RESPONSES = {
  reserveTransferAssets: '0x1234111',
  limitedReserveTransferAssets: '0x1234222',
  teleportAssets: '0x1234333',
  limitedTeleportAssets: '0x1234444',
}

export const xcmPalletMock = {
  reserveTransferAssets: () => ({
    signAndSend: (_signer: any, cb: any) => {
      const status = { isInBlock: true }
      const txHash = XCM_PALLET_RESPONSES.reserveTransferAssets
      const dispatchError = ''
      const dispatchInfo = {}

      return cb({
        status,
        txHash,
        dispatchError,
        dispatchInfo,
      })
    },
  }),
  limitedReserveTransferAssets: () => ({
    signAndSend: (_signer: any, cb: any) => {
      const status = { isInBlock: true }
      const txHash = XCM_PALLET_RESPONSES.limitedReserveTransferAssets
      const dispatchError = ''
      const dispatchInfo = {}

      return cb({
        status,
        txHash,
        dispatchError,
        dispatchInfo,
      })
    },
  }),
  teleportAssets: () => ({
    signAndSend: (_signer: any, cb: any) => {
      const status = { isInBlock: true }
      const txHash = XCM_PALLET_RESPONSES.teleportAssets
      const dispatchError = ''
      const dispatchInfo = {}

      return cb({
        status,
        txHash,
        dispatchError,
        dispatchInfo,
      })
    },
  }),
  limitedTeleportAssets: () => ({
    signAndSend: (_signer: any, cb: any) => {
      const status = { isInBlock: true, isFinalized: true }
      const txHash = XCM_PALLET_RESPONSES.limitedTeleportAssets
      const dispatchError = ''
      const dispatchInfo = {}

      return cb({
        status,
        txHash,
        dispatchError,
        dispatchInfo,
      })
    },
  }),
  limitedTeleportAssetsWithError: () => ({
    signAndSend: (_signer: any, cb: any) => {
      const status = { isInBlock: true, isFinalized: true }
      const txHash = XCM_PALLET_RESPONSES.limitedTeleportAssets
      const dispatchError = {
        toString: () => 'tx error',
      }
      const dispatchInfo = ''

      return cb({
        status,
        txHash,
        dispatchError,
        dispatchInfo,
      })
    },
  }),
}

export const RPC_MOCK = 'ws://localhost:32011'

export const injectorMock = {
  signer: {
    signPayload: () => null,
    signRaw: () => null,
    update: () => null,
  },
}

export const genericBodyMock = {
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
            id: chainSpecsMock.parachainAccount,
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
