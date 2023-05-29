const abi = {
  source: {
    hash: '0x797dc64fb4599ab922621bda463e9c07bbe88bd383c5264e6bce9a4d84d1929c',
    language: 'ink! 4.2.0',
    compiler: 'rustc 1.69.0-nightly',
    build_info: {
      build_mode: 'Debug',
      cargo_contract_version: '3.0.1',
      rust_toolchain: 'nightly-aarch64-apple-darwin',
      wasm_opt_settings: {
        keep_debug_symbols: false,
        optimization_passes: 'Z',
      },
    },
  },
  contract: {
    name: 'rps',
    version: '0.1.0',
    authors: ['[your_name] <[your_email]>'],
  },
  spec: {
    constructors: [
      {
        args: [
          {
            label: 'starting_member_cnt',
            type: {
              displayName: ['u16'],
              type: 8,
            },
          },
          {
            label: 'game_end_member_cnt',
            type: {
              displayName: ['u16'],
              type: 8,
            },
          },
          {
            label: 'max_life',
            type: {
              displayName: ['u8'],
              type: 5,
            },
          },
          {
            label: 'vote_per_round',
            type: {
              displayName: ['u8'],
              type: 5,
            },
          },
          {
            label: 'mint_cost',
            type: {
              displayName: ['Balance'],
              type: 10,
            },
          },
        ],
        default: false,
        docs: ['Constructor that initializes the `bool` value to the given `init_value`.'],
        label: 'new',
        payable: true,
        returnType: {
          displayName: ['ink_primitives', 'ConstructorResult'],
          type: 13,
        },
        selector: '0x9bae9d5e',
      },
    ],
    docs: [],
    environment: {
      accountId: {
        displayName: ['AccountId'],
        type: 3,
      },
      balance: {
        displayName: ['Balance'],
        type: 10,
      },
      blockNumber: {
        displayName: ['BlockNumber'],
        type: 2,
      },
      chainExtension: {
        displayName: ['ChainExtension'],
        type: 30,
      },
      hash: {
        displayName: ['Hash'],
        type: 29,
      },
      maxEventTopics: 4,
      timestamp: {
        displayName: ['Timestamp'],
        type: 9,
      },
    },
    events: [
      {
        args: [
          {
            docs: [],
            indexed: true,
            label: 'from',
            type: {
              displayName: ['Option'],
              type: 25,
            },
          },
          {
            docs: [],
            indexed: true,
            label: 'to',
            type: {
              displayName: ['Option'],
              type: 25,
            },
          },
          {
            docs: [],
            indexed: true,
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        docs: ['Event emitted when a token transfer occurs.'],
        label: 'Transfer',
      },
      {
        args: [
          {
            docs: [],
            indexed: true,
            label: 'from',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            docs: [],
            indexed: true,
            label: 'to',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            docs: [],
            indexed: true,
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        docs: ['Event emitted when a token approve occurs.'],
        label: 'Approval',
      },
      {
        args: [
          {
            docs: [],
            indexed: true,
            label: 'owner',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            docs: [],
            indexed: true,
            label: 'operator',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            docs: [],
            indexed: false,
            label: 'approved',
            type: {
              displayName: ['bool'],
              type: 6,
            },
          },
        ],
        docs: [
          'Event emitted when an operator is enabled or disabled for an owner.',
          'The operator can manage all NFTs of the owner.',
        ],
        label: 'ApprovalForAll',
      },
    ],
    lang_error: {
      displayName: ['ink', 'LangError'],
      type: 14,
    },
    messages: [
      {
        args: [],
        default: false,
        docs: [],
        label: 'get_game_info',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 15,
        },
        selector: '0x3c624e71',
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'get_all_members_info',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 18,
        },
        selector: '0x8db46dd6',
      },
      {
        args: [
          {
            label: 'token_id',
            type: {
              displayName: ['u32'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' A message that can be called from the user to join the game.'],
        label: 'join',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x2c254e82',
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'start_round',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x569c1eb2',
      },
      {
        args: [
          {
            label: 'rps_move',
            type: {
              displayName: ['u8'],
              type: 5,
            },
          },
          {
            label: 'salt_string',
            type: {
              displayName: ['String'],
              type: 12,
            },
          },
        ],
        default: false,
        docs: [],
        label: 'test_hash_generation',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 22,
        },
        selector: '0xf2e3b8cf',
      },
      {
        args: [
          {
            label: 'joined_id',
            type: {
              displayName: ['u16'],
              type: 8,
            },
          },
          {
            label: 'salted_hash_hex_string',
            type: {
              displayName: ['String'],
              type: 12,
            },
          },
        ],
        default: false,
        docs: [],
        label: 'make_move',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x5399fa71',
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'halt_round',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0xc0d38b40',
      },
      {
        args: [
          {
            label: 'joined_id',
            type: {
              displayName: ['u16'],
              type: 8,
            },
          },
          {
            label: 'rps_move',
            type: {
              displayName: ['u8'],
              type: 5,
            },
          },
          {
            label: 'salt_string',
            type: {
              displayName: ['String'],
              type: 12,
            },
          },
        ],
        default: false,
        docs: [' verify move', ''],
        label: 'verify_move',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x78a02a66',
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'process_match',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0xdcb82269',
      },
      {
        args: [
          {
            label: 'joined_id',
            type: {
              displayName: ['u16'],
              type: 8,
            },
          },
          {
            label: 'vote_state',
            type: {
              displayName: ['u8'],
              type: 5,
            },
          },
        ],
        default: false,
        docs: [' vote on halt', ''],
        label: 'vote_on_halt',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 13,
        },
        selector: '0x90a7529f',
      },
      {
        args: [],
        default: false,
        docs: [' end game from vote'],
        label: 'process_vote',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x0bd44625',
      },
      {
        args: [
          {
            label: 'joined_id',
            type: {
              displayName: ['u16'],
              type: 8,
            },
          },
        ],
        default: false,
        docs: [' get reward'],
        label: 'get_reward',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0xd759b94d',
      },
      {
        args: [
          {
            label: 'owner',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
        ],
        default: false,
        docs: [' Returns the balance of the owner.', '', ' This represents the amount of unique tokens the owner has.'],
        label: 'balance_of',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 23,
        },
        selector: '0x0f755a56',
      },
      {
        args: [
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Returns the owner of the token.'],
        label: 'owner_of',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 24,
        },
        selector: '0x99720c1e',
      },
      {
        args: [
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Returns the metadata url of the token.'],
        label: 'token_metadata',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 26,
        },
        selector: '0x93da7695',
      },
      {
        args: [
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Returns the approved account ID for this token if any.'],
        label: 'get_approved',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 24,
        },
        selector: '0x27592dea',
      },
      {
        args: [
          {
            label: 'owner',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            label: 'operator',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
        ],
        default: false,
        docs: [' Returns `true` if the operator is approved by the owner.'],
        label: 'is_approved_for_all',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 28,
        },
        selector: '0x0f5922e9',
      },
      {
        args: [
          {
            label: 'to',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            label: 'approved',
            type: {
              displayName: ['bool'],
              type: 6,
            },
          },
        ],
        default: false,
        docs: [' Approves or disapproves the operator for all tokens of the caller.'],
        label: 'set_approval_for_all',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0xcfd0c27b',
      },
      {
        args: [
          {
            label: 'to',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Approves the account to transfer the specified token on behalf of the caller.'],
        label: 'approve',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x681266a0',
      },
      {
        args: [
          {
            label: 'destination',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Transfers the token from the caller to the given destination.'],
        label: 'transfer',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x84a15da1',
      },
      {
        args: [
          {
            label: 'from',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            label: 'to',
            type: {
              displayName: ['AccountId'],
              type: 3,
            },
          },
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Transfer approved or owned token.'],
        label: 'transfer_from',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0x0b396f18',
      },
      {
        args: [
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
          {
            label: 'json_url',
            type: {
              displayName: ['String'],
              type: 12,
            },
          },
        ],
        default: false,
        docs: [' Creates a new token.'],
        label: 'mint',
        mutates: true,
        payable: true,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0xcfdd9aa2',
      },
      {
        args: [
          {
            label: 'id',
            type: {
              displayName: ['TokenId'],
              type: 2,
            },
          },
        ],
        default: false,
        docs: [' Deletes an existing token. Only the owner can burn the token.'],
        label: 'burn',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 19,
        },
        selector: '0xb1efc17b',
      },
    ],
  },
  storage: {
    root: {
      layout: {
        struct: {
          fields: [
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 0,
                },
              },
              name: 'joined',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 7,
                },
              },
              name: 'readied',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 7,
                },
              },
              name: 'matched',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 8,
                },
              },
              name: 'starting_member_cnt',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 8,
                },
              },
              name: 'game_end_member_cnt',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 5,
                },
              },
              name: 'vote_per_round',
            },
            {
              layout: {
                enum: {
                  dispatchKey: '0x00000000',
                  name: 'GameStatus',
                  variants: {
                    '0': {
                      fields: [],
                      name: 'NotStarted',
                    },
                    '1': {
                      fields: [],
                      name: 'RoundStarted',
                    },
                    '2': {
                      fields: [],
                      name: 'RoundHalted',
                    },
                    '3': {
                      fields: [],
                      name: 'RoundEnded',
                    },
                    '4': {
                      fields: [],
                      name: 'GameVote',
                    },
                    '5': {
                      fields: [],
                      name: 'GameEnded',
                    },
                  },
                },
              },
              name: 'game_status',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 2,
                },
              },
              name: 'current_round_no',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 8,
                },
              },
              name: 'required_moved_member_cnt',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 8,
                },
              },
              name: 'current_moved_member_cnt',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 5,
                },
              },
              name: 'max_life',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 8,
                },
              },
              name: 'current_vote_cnt',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 9,
                },
              },
              name: 'phase_ended_at',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 9,
                },
              },
              name: 'move_time_limit',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 9,
                },
              },
              name: 'reveal_time_limit',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 9,
                },
              },
              name: 'vote_time_limit',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 10,
                },
              },
              name: 'allocated_value',
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 10,
                },
              },
              name: 'mint_cost',
            },
            {
              layout: {
                root: {
                  layout: {
                    leaf: {
                      key: '0x652825b9',
                      ty: 3,
                    },
                  },
                  root_key: '0x652825b9',
                },
              },
              name: 'token_owner',
            },
            {
              layout: {
                root: {
                  layout: {
                    leaf: {
                      key: '0xc88dbea0',
                      ty: 3,
                    },
                  },
                  root_key: '0xc88dbea0',
                },
              },
              name: 'token_approvals',
            },
            {
              layout: {
                root: {
                  layout: {
                    leaf: {
                      key: '0xadb6cb2f',
                      ty: 2,
                    },
                  },
                  root_key: '0xadb6cb2f',
                },
              },
              name: 'owned_tokens_count',
            },
            {
              layout: {
                root: {
                  layout: {
                    leaf: {
                      key: '0x8a3f97c1',
                      ty: 11,
                    },
                  },
                  root_key: '0x8a3f97c1',
                },
              },
              name: 'operator_approvals',
            },
            {
              layout: {
                root: {
                  layout: {
                    leaf: {
                      key: '0xa845fab5',
                      ty: 12,
                    },
                  },
                  root_key: '0xa845fab5',
                },
              },
              name: 'token_metadata',
            },
          ],
          name: 'Rps',
        },
      },
      root_key: '0x00000000',
    },
  },
  types: [
    {
      id: 0,
      type: {
        def: {
          sequence: {
            type: 1,
          },
        },
      },
    },
    {
      id: 1,
      type: {
        def: {
          composite: {
            fields: [
              {
                name: 'token_id',
                type: 2,
                typeName: 'u32',
              },
              {
                name: 'owner',
                type: 3,
                typeName: 'AccountId',
              },
              {
                name: 'life',
                type: 5,
                typeName: 'u8',
              },
              {
                name: 'rps_move',
                type: 5,
                typeName: 'u8',
              },
              {
                name: 'salted_hash',
                type: 4,
                typeName: '[u8; 32]',
              },
              {
                name: 'last_moved_at',
                type: 2,
                typeName: 'u32',
              },
              {
                name: 'last_voted_at',
                type: 2,
                typeName: 'u32',
              },
              {
                name: 'is_rewarded',
                type: 6,
                typeName: 'bool',
              },
            ],
          },
        },
        path: ['rps', 'rps', 'GameMember'],
      },
    },
    {
      id: 2,
      type: {
        def: {
          primitive: 'u32',
        },
      },
    },
    {
      id: 3,
      type: {
        def: {
          composite: {
            fields: [
              {
                type: 4,
                typeName: '[u8; 32]',
              },
            ],
          },
        },
        path: ['ink_primitives', 'types', 'AccountId'],
      },
    },
    {
      id: 4,
      type: {
        def: {
          array: {
            len: 32,
            type: 5,
          },
        },
      },
    },
    {
      id: 5,
      type: {
        def: {
          primitive: 'u8',
        },
      },
    },
    {
      id: 6,
      type: {
        def: {
          primitive: 'bool',
        },
      },
    },
    {
      id: 7,
      type: {
        def: {
          sequence: {
            type: 8,
          },
        },
      },
    },
    {
      id: 8,
      type: {
        def: {
          primitive: 'u16',
        },
      },
    },
    {
      id: 9,
      type: {
        def: {
          primitive: 'u64',
        },
      },
    },
    {
      id: 10,
      type: {
        def: {
          primitive: 'u128',
        },
      },
    },
    {
      id: 11,
      type: {
        def: {
          tuple: [],
        },
      },
    },
    {
      id: 12,
      type: {
        def: {
          primitive: 'str',
        },
      },
    },
    {
      id: 13,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 11,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 11,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 14,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 1,
                name: 'CouldNotReadInput',
              },
            ],
          },
        },
        path: ['ink_primitives', 'LangError'],
      },
    },
    {
      id: 15,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 16,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 16,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 16,
      type: {
        def: {
          tuple: [8, 8, 5, 17, 2, 8, 8, 8, 10, 10, 10, 7],
        },
      },
    },
    {
      id: 17,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 0,
                name: 'NotStarted',
              },
              {
                index: 1,
                name: 'RoundStarted',
              },
              {
                index: 2,
                name: 'RoundHalted',
              },
              {
                index: 3,
                name: 'RoundEnded',
              },
              {
                index: 4,
                name: 'GameVote',
              },
              {
                index: 5,
                name: 'GameEnded',
              },
            ],
          },
        },
        path: ['rps', 'rps', 'GameStatus'],
      },
    },
    {
      id: 18,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 0,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 0,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 19,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 20,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 20,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 20,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 11,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 21,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 11,
          },
          {
            name: 'E',
            type: 21,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 21,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 0,
                name: 'CallRuntimeFailed',
              },
              {
                index: 1,
                name: 'NotOwner',
              },
              {
                index: 2,
                name: 'NotApproved',
              },
              {
                index: 3,
                name: 'TokenExists',
              },
              {
                index: 4,
                name: 'TokenNotFound',
              },
              {
                index: 5,
                name: 'CannotInsert',
              },
              {
                index: 6,
                name: 'CannotFetchValue',
              },
              {
                index: 7,
                name: 'NotAllowed',
              },
              {
                index: 8,
                name: 'TransferFailed',
              },
              {
                index: 9,
                name: 'InvalidStatus',
              },
              {
                index: 10,
                name: 'BurnFailed',
              },
              {
                index: 11,
                name: 'InvalidValue',
              },
            ],
          },
        },
        path: ['rps', 'rps', 'Error'],
      },
    },
    {
      id: 22,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 4,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 4,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 23,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 2,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 2,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 24,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 25,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 25,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 25,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 0,
                name: 'None',
              },
              {
                fields: [
                  {
                    type: 3,
                  },
                ],
                index: 1,
                name: 'Some',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 3,
          },
        ],
        path: ['Option'],
      },
    },
    {
      id: 26,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 27,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 27,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 27,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 0,
                name: 'None',
              },
              {
                fields: [
                  {
                    type: 12,
                  },
                ],
                index: 1,
                name: 'Some',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 12,
          },
        ],
        path: ['Option'],
      },
    },
    {
      id: 28,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 6,
                  },
                ],
                index: 0,
                name: 'Ok',
              },
              {
                fields: [
                  {
                    type: 14,
                  },
                ],
                index: 1,
                name: 'Err',
              },
            ],
          },
        },
        params: [
          {
            name: 'T',
            type: 6,
          },
          {
            name: 'E',
            type: 14,
          },
        ],
        path: ['Result'],
      },
    },
    {
      id: 29,
      type: {
        def: {
          composite: {
            fields: [
              {
                type: 4,
                typeName: '[u8; 32]',
              },
            ],
          },
        },
        path: ['ink_primitives', 'types', 'Hash'],
      },
    },
    {
      id: 30,
      type: {
        def: {
          variant: {},
        },
        path: ['ink_env', 'types', 'NoChainExtension'],
      },
    },
  ],
  version: '4',
};

export default abi;
