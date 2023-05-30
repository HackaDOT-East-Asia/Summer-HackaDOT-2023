# Double Hand

## 1. Youtube link to a Demo video

[Demo video](https://youtu.be/4zMfZnulojE)

## 2. Short Description of our project

Welcome to our immersive NFT gaming platform, a web-based application meticulously built on the cutting-edge Astar Network. This unique decentralized application (dApp) provides an innovative staking rewards distribution solution designed to make the dApp staking process more approachable and entertaining for users.

Our mission is to enhance user familiarity with the dApp staking process, transforming it from a potentially daunting task to a fun, rewarding, and stimulating gaming experience. We believe that blockchain and gaming are a natural fit, and our NFT game combines these elements to foster a better understanding of dApp staking while injecting an element of excitement into the process.

## 3. How to run [ Local Netnetwork ]

- build contract

  ```bash
  cd rps_merge
  cargo contract build
  # Now deploy on local network
  ```

- run frontend
  ```bash
  cd ui
  yarn install
  ```
  Create .env file in `ui/.env`
  ```bash
  NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=<deployed contract address>
  ```
  Start App
  ```bash
  yarn dev
  ```

## 4. Description of our team

We a team composed with three developer and one designer.

<strong>Daniel Lee</strong>

- Team lead
- Frontend & Documentation
- [github]('https://github.com/leedc0101')

<strong>HJ 1</strong>

- Blockchain Developer
- Tech Lead

<strong>HJ 2</strong>

- Frontend Developer
- Frontend
- [github]('https://github.com/imhyeonji')

<strong>Fruity Bae</strong>

- Designer
- UI & NFT Design
- Instagram [@a.bae.c]('https://www.instagram.com/a.bae.c/')
