# DAO Oriented Protocol
## Motivation
- Many applications in existence today have a governing body. For example, "note", one of the famous blog apps in Japan, is operated by a company.
- Therefore, if the operating company goes bankrupt, all the data and applications are destined to be lost.
- It is very unfortunate and a loss for many.
- The useful information written in the past and the hearts of people who used and attached to this application will be lost together.
- The purpose of developing a dApp I named "DAO Oriented Protocol" is to prevent these sad events from happening in the future.
- By implementing a protocol that combines blockchain technology and DAO ideas, I hope that all applications that adopt this protocol will become sustainable.
## Basic Design
- This protocol is designed to behave like a computer's Operating System.
- A contract named "application_core" is designed to manage all functionality.
- By implementing all functions as independent contracts and installing them in this "application_core", you can call them with a unified interface.
- Contracts installed in "application_core" must implement a trait called "contract_base" to achieve the basic functionality of the "DAO Oriented Protocol".
- It is possible to implement all features from scratch. However, basic DAO functions are already implemented as pre-installed functions. You can also use it.
## Project Structure
- "protocol"
  -  The whole body of "DAO Oriented Protocol" is stored here.
  - "application_core"
    - A core contract that manages the entire "DAO Oriented Protocol".
  - pre_insrtall
    - "default_contract"
      - This is a fictitious contract for the interface implemented to make each contract in the "DAO Oriented Protocol" communicate with each other.
    - "default_election"
      - It is one of the preintall contracts that provides the ability to vote and vote within the protocol.
    - "default_member"
      - It is one of the preintall contracts that provides the ability to manage members and election commissioners within the protocol.
    - "default_prposal"
      - It is one of the plaintall contracts that provides the ability to manage proposals within the protocol.
  - "logics"
    - "common"
      - A program that implements common functions such as type conversion that are required in the protocol is stored.
    - "traits"
      - "contract_base"
        - All contracts intended to be installed in "application_core" must implement this trait.
      - "errors"
        - Common error definition.
      - "types"
        - Common type definition.
  - "test"
    - The following tests are implemented in "protocol_test.ts".
      - Deploying all the contracts needed to make the protocol work.
      - Initialization function calls required to make the protocol work.
      - Testing the proposal function for adding members.
- "example"
  - "flipper_oriented_dao"
    - This is a flipper dApp sample using "DAO Oriented Protocol". 
  - "community_protocol"
    - This "Community Protocol" is a dApp based on DAO.
## An example of a dApp using the "DAO Oriented Protocol"
### Flipper Oriented Dao
- "dao_oriented_flipper" contract
  - This contract is a normal flipper contract with the addition of "DAO Oriented Protocol".
  - The "flip" function (named "dao_flip" function this time) is implemented so that it can only be called from the "proposal manger" pre-installed in the protocol.
  - That is, the value will not be reversed unless it is proposed for action and voted on by the members.
- frontend apps
  - A minimal front-end application to run this sample contract.
- test
  - Testing from deployment to initial configuration of "DAO Oriented Protocol".
  - Deployment of contract to operate "Dao Oriented Flipper", installation to "Application Core", implementation of flip using DAO mechanism. 
### Community Protocol
- This is the purpose of the Community Protocol. Please Check this article(https://realtakahashi-work.medium.com/aiming-for-a-fairer-society-will-dao-change-society-ca5f305294c0)
- Please refer to this article for thoughts on the features and design of the Community Protocol.(https://medium.com/@realtakahashi-work/community-protocol-677916ce0dd0)

## More detail
- Please check this article (https://realtakahashi-work.medium.com/dao-oriented-protocol-aiming-to-make-all-apps-sustainable-47501a4b8d04).