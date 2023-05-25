export const objectBody = {
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

export const arrayBody = [
  1,
  {
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
]
