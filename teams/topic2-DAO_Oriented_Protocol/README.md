# Youtube link to your Demo video (5-10min length)
- https://youtu.be/FOWqobzjV8E
# Short Description of your project
## Purpose of this dApp
- Making all dApps sustainable by providing a DAO layer as a protocol
- [The purpose of this protocol is summarized in this article.](https://realtakahashi-work.medium.com/dao-oriented-protocol-aiming-to-make-all-apps-sustainable-47501a4b8d04)
## List of features
- Common interface
- Member management
- Proposal management
- Voting management
## How It Works
- Use it as a framework for all dApps that want to include DAO functionality.
- A common interface, each DAO function is implemented as an independent contract.
- Developers can use this framework to add their own logic and quickly implement dApps that include DAO functionality.
## Structure
```
              ------------------------------
              |     Application Core       |
              ------------------------------
               ↓             ↓            ↓
 ------------------ -------------------- -------------------- 
 | Member Manager | | Proposal Manager | | Election Manager |
 ------------------ -------------------- --------------------
                     ↓            ↓    
    -----------------------  -----------------------
    | Your Own Contract 1 |  | Your Own Contract 2 |
    -----------------------  -----------------------

```
# How to run your code
## How to implement using this protocol
1. Implement the traits implemented in "protocol/logics/traits/contract_base/contract_base.rs" in your contract.
2. We will implement the following two contract functions to interface with other contracts within this protocol:
```
#[ink(message)]
pub fn extarnal_get_data_interface(&self,target_function:String) -> Vec<Vec<u8>> {
    self.get_data(target_function)
}

#[ink(message)]
pub fn extarnal_execute_interface(&mut self, command:String, parameters_csv:String, caller_eoa: AccountId) -> core::result::Result<(), ContractBaseError>{
    self._execute_interface(command, parameters_csv, caller_eoa)
}
```
3. Implement "command_list" to execute functions from the common interface. Please refer to "example/flipper_oriented_dao/contracts/dao_oriented_flipper/lib.rs" for the specific implementation method.
## how to run the example "flipper_oriented_dao" locally
### contract
1. Build all the contracts below. I am using ink-4.0.0.
  - protocol/application_core
  - protocol/pre_install/default_election
  - protocol/pre_install/default_member
  - protocol/pre_install/default_proposal
  - example/flipper_oriented_dao/contracts/dao_oriented_flipper
2. Launch Astar's local collator node and deploy the contracts in the following order:
- default_election, default_member, default_proposal
- application_core(Set the contract address of each DAO deployed above to the constructor parameter of application_core.)
- flipper_oriented_dao/contracts/(Set the address of proposal_manager and the initial value of flip_value as parameters.)
3. Call each of the contract functions below for the initial setup of application_core.
- configure_pre_install_member_manager
- configure_pre_install_proposal_manager
- configure_pre_install_election
### frontend
1. To set local environment variables, create ".env.local" file in frontend directory and set the following values. Set each contract address after your own deployment.
```
NEXT_PUBLIC_DAO_ORIENTED_FLIPPER_CONTRACT_ADDRESS=XMx2AL7FUhHCBfPYqHausZAU4ARXr7bAsUWNH3cpDbPJEE1
NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS=XoHMMnqChwiU13LZZABQLNz3vTbcnY347K55HVRn2VvScKE
NEXT_PUBLIC_DEFAULT_ELECTION_CONTRACT_ADDRESS=XFQ4Tm7LDfxrNq2gRMmeotWvrEtMahsTQ6HxnYZCLSTQUre
NEXT_PUBLIC_DEFAULT_PROPOSAL_CONTRACT_ADDRESS=XpiYVNbGcXM1bB3Cke9h7uJ3RSZfisqqq4XbtdErcZJZFc6
NEXT_PUBLIC_BLOCKCHAIN_URL=ws://127.0.0.1:9944
```
2. Run "yarn install" to install the required components.
3. Run "yarn dev" and access "localhost:3000" in your browser.
## How To Test
### Protocol
- There is a test code implemented with typescript in the path below.
- By checking this code, it is possible to understand how the basics of the protocol work.
- Path:teams/topic2-DAO_Oriented_Protocol/src/dao_oriented_protocol/protocol/test
## Exapmple "DAO Oriented Flipper
- There is a test code implemented with typescript in the path below.
- By checking this code, it is possible to understand how the basics of the example dapp work.
- Path:teams/topic2-DAO_Oriented_Protocol/src/dao_oriented_protocol/example/flipper_oriented_dao/contracts/test
# Description of your team(Team Background with both LinkedIn and Github Page)
## Purpose Of Development
- I develop dApps with two purposes. The reason is as follows.
  - The first is about DAOs. I believe DAO is an effective tool for sustainable community management. To create a framework that can be easily used by any dApp that needs a DAO mechanism.
  - The second is to design a mechanism to reuse WASM contracts. I tried it again this time, but I still don't think this design is the best. I will continue this challenge.
## Member List
- Shin Takahashi(Astar Network Technical Ambassador)
## Web Sites
- [LinkedIn](https://jp.linkedin.com/in/%E7%9C%9F-%E9%AB%98%E6%A9%8B-255404170)
- [Github](https://github.com/realtakahashi)
- [Twitter](https://twitter.com/realtakahashi1)
- [Medium](https://realtakahashi-work.medium.com/)
