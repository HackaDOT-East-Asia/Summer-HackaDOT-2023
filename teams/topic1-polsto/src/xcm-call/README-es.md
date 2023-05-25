XCM SDK
=======

[![CircleCI](https://circleci.com/gh/blockcoders/xcm-sdk/tree/main.svg?style=svg)](https://circleci.com/gh/blockcoders/xcm-sdk/tree/main)
[![Coverage Status](https://coveralls.io/repos/github/blockcoders/xcm-sdk/badge.svg?branch=main)](https://coveralls.io/github/blockcoders/xcm-sdk?branch=main)
[![CodeQL](https://github.com/blockcoders/xcm-sdk/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/blockcoders/xcm-sdk/actions/workflows/codeql-analysis.yml)
[![npm](https://img.shields.io/npm/v/xcm-sdk?label=version&logo=npm)](https://www.npmjs.com/package/xcm-sdk)
[![npm](https://img.shields.io/npm/dw/xcm-sdk?logo=npm)](https://www.npmjs.com/package/xcm-sdk?activeTab=versions)
[![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/xcm-sdk)](https://snyk.io/test/github/blockcoders/xcm-sdk)
[![License](https://img.shields.io/badge/license-MIT%20License-brightgreen.svg)](https://opensource.org/licenses/MIT)

## Acerca

XCM SDK es una herramienta que proporciona una interfaz para enviar mensajes XCM para cadenas de bloques basadas en Substrate. Esta biblioteca está escrita en Typescript, por lo que se puede importar en un conjunto completamente nuevo de aplicaciones o dApps que usan motores Javascript/Typescript como Node.js.

## Introduccion

### Instalar

```sh
npm i xcm-sdk
```

### Importar

```ts
// JavaScript
const { Provider } = require("xcm-sdk");

// TypeScript
import { Provider } from "xcm-sdk";
```

### Proveedor

```ts
const provider = new Provider(rpc, sender);
```

<table>
  <tr>
    <th>Parametro</th>
    <th>Descripcion</th>
  </tr>
  <tr>
    <td>rpc</td>
    <td>rpc URL</td>
  </tr>
    <tr>
    <td>sender</td>
    <td>firmante de la transacción</td>
  </tr>
</table>

### Ejemplos

Si quieres firmar con Alice en un nodo local:

```ts
import { Keyring } from '@polkadot/keyring'
import { cryptoWaitReady } from '@polkadot/util-crypto'

const rpc = "ws://127.0.0.1:37345"; // ws del nodo local
await cryptoWaitReady();

const keyring = new Keyring({ type: "sr25519" });
const sender = keyring.addFromUri("//Alice");

const provider = new Provider(rpc, sender);
```

Si quieres firmar con una semilla mnemotécnica

```ts
import { Keyring } from '@polkadot/keyring'


const sender = keyring.addFromMnemonic("<your mnemonic seed here>");
```

Si quieres firmar con la extensión de polkadotjs

```ts
import { web3FromAddress, web3Accounts, web3Enable } from "@polkadot/extension-dapp";

const extensions = await web3Enable("<your app name>");
const accounts = await web3Accounts();
const accountId = accounts[0].address;

const injector = await web3FromAddress(accountId);

const provider = new Provider(rpc, accountId);
provider.setInjectorSigner(injector.signer);
```

## Metodos soportados

<a href="https://wiki.polkadot.network/docs/learn-xcm#reserve-asset-transfer"> Reserve Asset Transfer </a> con los metodos reserveTransferAsset y LimitedReserveTransferAsset y <a href="https://wiki.polkadot.network/docs/learn-xcm#asset-teleportation">Asset teleportation </a> con los metodos teleportAsset y LimitedTeleportAsset.

```ts
provider.limitedReserveTransferAssets(params);

provider.reserveTransferAssets(params);

provider.limitedReserveTransferAssets(params);

provider.reserveTransferAssets(params);
```

### Parametros de los metodos

<table>
  <tr>
    <th>Parametro</th>
    <th>Descripcion</th>
  </tr>
  <tr>
    <td>destination</td>
    <td>El destino para transferir el activo. Si desea transferir activos de la cadena 'relay/principal' a una cadena 'parachain', configure 'Parachain'. Predeterminado 'Here'.</td>
  </tr>
  <tr>
    <td>destinationParents</td>
    <td>0 es el valor predeterminado, 1 cuando desea transferir de parachain a relaychain o de parachain a parachain</td>
  </tr>
  <tr>
    <td>destinationValue</td>
    <td>El valor de destino, por ejemplo, una identificación de parachain</td>
  </tr>
  <tr>
    <td>beneficiary</td>
    <td>objetivo del beneficiario, una accountId32</td>
  </tr>
  <tr>
    <td>beneficiaryParents</td>
    <td>0 por defecto</td>
  </tr>
  <tr>
    <td>beneficiaryValue</td>
    <td>El valor del beneficiario, la dirección de la cuenta para enviar el activo</td>
  </tr>
  <tr>
    <td>amount</td>
    <td>cantidad de tokens a transferir</td>
  </tr>
  <tr>
    <td>assetId</td>
    <td>El identificador del asset para transferir desde una parachain, asegúrese de que la parachain admita el activo y que la cuenta del remitente tenga suficientes activos para transferir</td>
  </tr>
  <tr>
    <td>weightLimit</td>
    <td>Opcional, solo para métodos limitados. Establece el peso máximo para la transaccion</td>
  </tr>
</table>

### Descargo de responsabilidad

Depende de la configuración de la parachain o la relay chain, debe usar la teletransportación de activos o la transferencia de activos de reserva. Asegúrese de saber qué método usar antes de ejecutar cualquier transferencia. Puedes buscar en cualquier escaneo para saber, por ejemplo <a href="https://rococo.subscan.io/xcm_transfer">rococo scan</a>

## Ejemplos en Rococo

Si quieres hacer pruebas en Testnet, tienes Rococo.
</br>
Consigue algunos activos: <a href="https://app.element.io/#/room/#rococo-faucet:matrix.org">Rococo faucet</a>

### Config

Los ejemplos están en ./examples/rococo/, puede poner tu configuración en ./examples/rococo/rococo-examples-util.ts. Luego puedes ejecutar un comando por cada ejemplo. Si quieres ejecutarlos de forma manual, debes crear tu propio script (.js o .ts) e importar las dependencias.

```ts
export const rococoExampleUtils = {
  rococoRpc: 'wss://rococo-rpc.polkadot.io',
  rockMineRpc: 'wss://rococo-rockmine-rpc.polkadot.io',
  rockMineParachainId: 1000,
  mangataParachainId: 2110,
  daliParachainId: 2087,
  senderMnemonic: '<your account mnemonic>',
  rockmineDestinationAccount: '<rockmine address account>',
  daliDestinationAccount: '<dali destination account>',
  rococoDestinationAccount: '<rococo address account>',
  mangataDestinationAccount: '<mangata address account>',
  rocAmount: <amount to transfer>,
}
```

### Enviar activos de Rococo a Rockmine

comando:

```ts
npx ts-node src/examples/rococo/rococo-to-rockmine.ts
```

manual:

```ts
const destination = "Parachain";
const destinationValue = 2000; // Rockmine parchain id
const beneficiary = "AccountId32";
const beneficiaryValue = "<rockmine account address>"; // account address
const amount = 1000000000000000;

const res = await provider.limitedTeleportAssets({
  destination,
  destinationValue,
  beneficiary,
  beneficiaryValue,
  amount,
});
```

o

comando:

```ts
npx ts-node src/examples/rococo/rococo-to-rockmine-no-limited.ts
```

manual:

```ts
  const destination = "Parachain"
  const destinationValue = 2000 // Rockmine parchain id
  const beneficiary = "AccountId32"
  const beneficiaryValue = "<rockmine account address>" // account address
  const amount = 1000000000000000

  const res = await provider.teleportAssets({
    destination,
    destinationValue,
    beneficiary,
    beneficiaryValue,
    amount,
  });
```

### Enviar activos de RockMine a Rococo

comando:

```ts
npx ts-node src/examples/rococo/rockmine-to-rococo.ts
```

manual:

```ts
const destinationParents = 1; // Destination to Rococo
const beneficiary = "AccountId32";
const beneficiaryValue = "<rococo account address>"; // account address
const amount = 1000000000000000;

const res = await provider.limitedTeleportAssets({
  destination,
  destinationValue,
  beneficiary,
  beneficiaryValue,
  amount,
});
```

### Enviar Activo de Rococo a Mangata

El activo ROC en Mangata es el activo con id 4. Puedes chequear <a href="https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Froccoco-testnet-collator-01.mangatafinance.cloud#/chainstate">aquí</a>, en "SELECTED STATE QUERY" selecciona tokens, luego en el campo u128 input pon 4.

comando:

```ts
npx ts-node src/examples/rococo/rococo-to-mangata-no-limited.ts
```

manual:

```ts
  const destination = "Parachain"
  const destinationValue = 2110 // Mangata parchain id
  const beneficiary = "AccountId32"
  const beneficiaryValue = "<mangata account address>" // account address
  const amount = 1000000000000000

  const res = await provider.reserveTransferAssets({
    destination,
    destinationValue,
    beneficiary,
    beneficiaryValue,
    amount,
  });
```

ver token transferido:
![](.images/mangata-roc.png)

## Otros ejemplos

<a href="./src/examples/local-network/readme-es.md">ejemplos en un red local</a>

## Soporte para otras paletas y métodos

El sdk también tiene un método para hacer extrinsics personalizados definidos por el usuario. Puedes llamar a cualquier paleta y método y pasar un cuerpo personalizado a ese método por tu cuenta.

```ts
provider.customExtrinsic(params)
```

<table>
  <tr>
    <th>Parámetro</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>asSudo</td>
    <td>pase true si desea ejecutar el extrinsic como sudo, por defecto es false</td>
  </tr>
  <tr>
    <td>pallet</td>
    <td>La paleta a llamar, por ejemplo "polkadotXcm", "xcmPallet"</td>
  </tr>
  <tr>
    <td>method</td>
    <td>El método a llamar en la paleta, por ejemplo: "reserveTransferAssets"</td>
  </tr>
  <tr>
    <td>body</td>
    <td>Los argumentos para el método, pueden ser un arreglo o un objeto</td>
  </tr>
</table>

## Ejemplos

### Teletransportar activos

Desde Rococo a Rockmine utilizando el cuerpo como objeto:

comando:

```sh
npx ts-node src/examples/custom-extrinsic/teleport-relaychain-to-parachain.ts
```

manual:

```ts
const pallet = "xcmPallet"
const method = "limitedTeleportAssets"
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
              id: u8aToHex(decodeAddress("<rockmine address account>")),
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

const res = await provider.customExtrinsic({
    pallet,
    method,
    body,
})
```

De Rococo a Rockmine utilizando el cuerpo como un arreglo:

```ts
const pallet = "xcmPallet"
const method = "limitedTeleportAssets"
const body = [
    // dest
    {
      V1: {
        parents: 0,
        interior: {
          X1: {
            Parachain: 1000,
          },
        },
      },
    },

    // beneficiary
    {
      V1: {
        parents: 0,
        interior: {
          X1: {
            AccountId32: {
              network: 'Any',
              id: u8aToHex(decodeAddress("<rockmine address account>")),
            },
          },
        },
      },
    },

    // assets
    {
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

    // feeAssetItem
    0,

    // weigthLimit
    'Unlimited',
  ]

const res = await provider.customExtrinsic({
    pallet,
    method,
    body,
})
```

De Rockmine a Rococo:

comando:

```sh
npx ts-node src/examples/custom-extrinsic/teleport-parachain-to-relay.ts
```

manual:

```ts
const pallet = 'xcmPallet'
const method = 'limitedTeleportAssets'
const body = {
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
              id: u8aToHex(decodeAddress('<rococo address account>')),
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

  const res = await provider.customExtrinsic({
    pallet,
    method,
    body,
  })
```

### Multilocalización de asset

De <a href="./src/examples/local-network/readme-es.md">este ejemplo de red local</a>, para marcar un activo en trappist como multilocalización:

comando:

```sh
npx ts-node src/examples/custom-extrinsic/mark-asset-as-multilocation.ts
```

manual:

```ts
const pallet = "assetRegistry"
const method = "registerReserveAsset"
const body = {
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

const res = await provider.customExtrinsic({
  asSudo: true,
  pallet,
  method,
  body,
})
```

## Uso de CLI

xcm sdk es también una herramienta de interfaz de línea de comandos que te ayuda a transferir y teletransportar activos entre cadenas.

instalar:

```sh
npm i -g xcm-sdk
```

Hay 4 comandos disponibles:

```sh
xcm-sdk limitedReserveTransferAssets [..args]
xcm-sdk reserveTransferAssets [..args]
xcm-sdk teleportAssets [...args]
xcm-sdk limitedTeleportAssets [..args]
```

comandos:

![](.images/cli/cli.png)

argumentos:

<table>
  <tr>
    <th>Arg</th>
    <th>Significado</th>
    <th>Descripción</th>
  </tr>
  <tr>
    <td>--dest</td>
    <td>destination</td>
    <td>
    El destino para transferir el activo. Si desea transferir el activo de la relaychain a una parachain, establezca "Parachain". Valor por defecto 'Here'.</td>
  </tr>
  <tr>
    <td>--destP</td>
    <td>Destination Parents</td>
    <td>0 es por defecto, 1 cuando se quiere transferir de una parachain a relaychain</td>
  </tr>
  <tr>
    <td>--destV</td>
    <td>Destination Value</td>
    <td>El valor de destino, por ejemplo un parachain id</td>
  </tr>
  <tr>
    <td>--ben</td>
    <td>Beneficiary</td>
    <td>objetivo beneficiario, un accountId32</td>
  </tr>
  <tr>
    <td>--benV</td>
    <td>Beneficiary Value</td>
    <td>Valor del beneficiario, dirección de la cuenta para enviar el activo</td>
  </tr>
  <tr>
    <td>--a</td>
    <td>Amount</td>
    <td>Beneficiary value, account address to send the asset to</td>
  </tr>
  <tr>
    <td style="white-space: nowrap;">--assetId</td>
    <td>Asset Id</td>
    <td>AssetId para transferir desde parachain, asegúrese de que la parchain soporta el activo y la cuenta del remitente tiene suficiente activo para transferir</td>
  </tr>
  <tr>
    <td>--wl</td>
    <td>Weight Limit</td>
    <td>Opcional, sólo para métodos limitados. Establece el peso máximo del extrinsic</td>
  </tr>
</table>

### Ejemplos del CLI

<a href="./.docs/cli-examples-es.md">Ver ejemplos del cli</a>

## Probar

Ejecución de las pruebas unitarias.

```sh
npm run test
```

Ejecución de la cobertura de pruebas.

```sh
npm run test:cov
```

## Registro de cambios

Consulte [Changelog](CHANGELOG.md) para más información.

## Contribuye

¡Las contribuciones son bienvenidas! Consulte [Contributing](CONTRIBUTING.md).

## Colaboradores

- [**Jose Ramirez**](https://github.com/0xslipk)
- [**Fernando Sirni**](https://github.com/fersirni)
- [**Ruben Gutierrez**](https://github.com/RubenGutierrezC)

## Licencia

Con licencia MIT - consulte el archivo [LICENSE](LICENSE) para obtener más información.
