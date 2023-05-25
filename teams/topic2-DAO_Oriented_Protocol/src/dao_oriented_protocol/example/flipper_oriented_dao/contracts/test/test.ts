import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise, CodePromise } from "@polkadot/api-contract";
import proposalManagerContract from "./contract_json/defaultProposalContract.json";
import proposalManagerAbi from "../../../../target/ink/default_proposal/default_proposal.json";
import memberManagerContract from "./contract_json/defaultMemberContract.json";
import memberManagerAbi from "../../../../target/ink/default_member/default_member.json";
import electionManagerContract from "./contract_json/defaultElectionContract.json";
import electionManagerAbi from "../../../../target/ink/default_election/default_election.json";
import applicationCoreContract from "./contract_json/applicationCoreConatract.json";
import applicationCoreAbi from "../../../../target/ink/application_core/application_core.json";
import { BN } from "@polkadot/util";
import assert from "assert";
import flipperOrientedDaoContract from "./contract_json/flipperOrientedDaoContract.json";
import flipperOrientedDaoAbi from "../../../../target/ink/dao_oriented_flipper/dao_oriented_flipper.json";

const storageDepositLimit = null;
const first_delimiter = "$1$";

let memberManagerContractAddress = "";
let proposalManagerContractAddress = "";
let electionManagerContractAddress = "";
let applicationCoreContractAddress = "";
let daoOrientedFlipperAddress = "";
let api: any;
let deployer: any;
let keyring:any;

let next_scenario:number = 1;

/// controller function
const test_controller =async () => {
  switch (next_scenario){
    case 1:
      await deployProposalManager(test_controller);
      break;
    case 2:
      await deployMemberManager(test_controller);
      break;
    case 3:
      await deployElectionManager(test_controller);
      break;
    case 4:
      await deployApplicationCore(test_controller);
      break;
    case 5:
      await callConfigurePreInstallMemberManager(test_controller);
      break;
    case 6:
      await callConfigurePreInstallProposalManager(test_controller);
      break;
    case 7:
      await callConfigurePreInstallElectionManager(test_controller);
      break;
    case 8:
      await doAfterDeployTest();
      await createProposalForAddingNewMemeber(test_controller);
      break;
    case 9:
      await checkProposalList(1,"Add Bob");
      await createElection(test_controller,"0");
      break;
    case 10:
      await voteForProposal(test_controller, "0", "yes");      
      break;
    case 11:
      await endElection(test_controller, "0");
      break;
    case 12:
      await executeProposal(test_controller, "0");
      break;
    case 13:
      await checkMember(2,"Bob");
      await deployFlipperOrientedDao(test_controller);
      break;
    case 14:
      const param1 = "2$1$Suggestion to install dao_flip_contract$1$I suggest to install dao_flip_contract which I have implemented$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$" +
        applicationCoreContractAddress +
        "$1$install_software$1$dao_flip$2$dao_flip$2$description_dao_flip$2$" +
        daoOrientedFlipperAddress;
      await createProposal(test_controller,param1);
      break;
    case 15:
      await checkProposalList(2,"Suggestion to install dao_flip_contract");
      await createElection(test_controller,"1");
      break;
    case 16:
        await voteForProposal(test_controller, "1", "yes");
        break;
    case 17:
      deployer = keyring.addFromUri("//Bob");
      await voteForProposal(test_controller, "1", "yes");
      break;
    case 18:
        deployer = keyring.addFromUri("//Alice");
        await endElection(test_controller, "1");
        break;
    case 19:
        await installSoftware(test_controller,"1");
        break;
    case 20:
        await checkSoftwareList(1, "dao_flip", daoOrientedFlipperAddress);
        const param2 = "2$1$flip value$1$I want to flip value$1$https://github.com/realtakahashi/dao_oriented_protocol$1$This is test$1$" +
            daoOrientedFlipperAddress + 
            "$1$dao_flip$1$";
        await checkFlipValue("false");
        await createProposal(test_controller,param2);
        break;
    case 21:
        await checkProposalList(3,"flip value");
        await createElection(test_controller,"2");
        break;
    case 22:
        await voteForProposal(test_controller, "2", "yes");
        break;
    case 23:
        deployer = keyring.addFromUri("//Bob");
        await voteForProposal(test_controller, "2", "yes");
        break;
    case 24:
        deployer = keyring.addFromUri("//Alice");
        await endElection(test_controller, "2");
        break;
    case 25:
        await executeProposal(test_controller, "2");
        break;
    case 26:
        await checkFlipValue("true");
        api.disconnect();
        break;
    default:
      api.disconnect();
      break;
  }
  next_scenario++;    
}

/// utility functions
export const getContractAddresses = ():{memberManagerAddress:string,propsalManagerAddress:string,electionManagerAddress:string,applicaitonCoreAddress:string} => {
  return {
    memberManagerAddress:memberManagerContractAddress,
    propsalManagerAddress:proposalManagerContractAddress,
    electionManagerAddress:electionManagerContractAddress,
    applicaitonCoreAddress:applicationCoreContractAddress
  };
}

/// query functions
const checkFlipValue =async (checkValue:string) => {
    console.log("checkFlipValue Start");
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const contract = new ContractPromise(
      api,
      flipperOrientedDaoAbi,
      daoOrientedFlipperAddress
    );
    const { gasConsumed, result, output } = await contract.query.get(
      deployer.address,
      {
        value: 0,
        gasLimit: gasLimit,
        storageDepositLimit,
      },
    );
    if (output !== undefined && output !== null) {
      //@ts-ignore
      const actual_value = output.toHuman().Ok.toString() ?? "NaN";
      assert.equal(actual_value,checkValue);
      console.log("checkFlipValue End");
    }
  }

const checkSoftwareList =async (checkcount:number, name:string, contractAddress:string) => {
    console.log("checkSoftwareList Start");
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const contract = new ContractPromise(
      api,
      applicationCoreAbi,
      applicationCoreContractAddress
    );
    const { gasConsumed, result, output } = await contract.query.getInstalledSoftware(
      deployer.address,
      {
        value: 0,
        gasLimit: gasLimit,
        storageDepositLimit,
      },
    );
    if (output !== undefined && output !== null) {
      //@ts-ignore
      let response_json = output.toJSON().ok;
      let json_data = JSON.parse(JSON.stringify(response_json));
      assert.equal(json_data.length,checkcount);
      assert.equal(json_data[checkcount-1].name,name);
      assert.equal(json_data[checkcount-1].contractAddress,contractAddress);
      console.log("checkSoftwareList End");
    }
  }
  
const checkProposalList =async (checkcount:number, title:string) => {
  console.log("checkProposalList Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getProposalInfoList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,checkcount);
    assert.equal(json_data[checkcount-1].title,title);
    console.log("checkProposalList End");
  }
}


const doAfterDeployTest =async () => {
  console.log("doAfterDeployTest Start");
  await checkFirstMember();
  await checkPreInstallSoftware();
  
}

const checkMember =async ( memberCount:number, addedMemberName:string) => {
  console.log("checkMember Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getMemberList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,memberCount);
    assert.equal(json_data[memberCount-1].name,addedMemberName);
    console.log("checkMember End");
  }
}

const checkFirstMember =async () => {
  console.log("checkFirstMember Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getMemberList(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,1,"member count is not 1.");
    assert.equal(json_data[0].name,"Alice","member is not Alice.");
  }
}

const checkPreInstallSoftware =async () => {
  console.log("checkPreInstallSoftware Start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasConsumed, result, output } = await contract.query.getPreInstalledSoftware(
    deployer.address,
    {
      value: 0,
      gasLimit: gasLimit,
      storageDepositLimit,
    },
  );
  if (output !== undefined && output !== null) {
    //@ts-ignore
    let response_json = output.toJSON().ok;
    // console.log("output.toJSON():",output.toJSON());
    let json_data = JSON.parse(JSON.stringify(response_json));
    assert.equal(json_data.length,3,"pre_software count is not 3.");
    assert.equal(json_data[0].name,"Member Manager");
    assert.equal(json_data[1].name,"Proposal Manager");
    assert.equal(json_data[2].name,"Election Manager");
  }
}

/// transaction functions
const installSoftware = async (
    callBack: () => void,
    parameter:string  
  ) => {
    console.log("installSoftware start");
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const contract = new ContractPromise(
      api,
      applicationCoreAbi,
      applicationCoreContractAddress
    );
    
    const { gasRequired } = await contract.query.installSoftware(
      deployer.address,
      { value: 0, gasLimit: gasLimit },
      parameter
    );
    const tx = await contract.tx.installSoftware(
      { value: 0, gasLimit: gasRequired },
      parameter
    );
  
    //@ts-ignore
    const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events) == true) {
          console.log("### Transaction is failure.");
        }
        unsub();
        console.log("installSoftware end");
        callBack();
      }
    });
  }

const createProposal = async (
    callBack: () => void,
    parameter:string  
  ) => {
    console.log("createProposal start");
    const gasLimit: any = getGasLimitForNotDeploy(api);
  
    const contract = new ContractPromise(
      api,
      applicationCoreAbi,
      applicationCoreContractAddress
    );
    
    const { gasRequired } = await contract.query.executeInterface(
      deployer.address,
      { value: 0, gasLimit: gasLimit },
      proposalManagerContractAddress,
      "add_proposal",
      parameter
    );
    const tx = await contract.tx.executeInterface(
      { value: 0, gasLimit: gasRequired },
      proposalManagerContractAddress,
      "add_proposal",
      parameter
    );
  
    //@ts-ignore
    const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events) == true) {
          console.log("### Transaction is failure.");
        }
        unsub();
        console.log("createProposal end");
        callBack();
      }
    });
  }

const executeProposal = async (callBack: () => void, targetProposalId:string) => {
  console.log("executeProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerContractAddress,
    "execute_proposal",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerContractAddress,
    "execute_proposal",
    targetProposalId
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("executeProposal end");
      callBack();
    }
  });
}

const endElection = async (callBack: () => void,
  targetProposalId:string
) => {
  console.log("endElection start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerContractAddress,
    "end_election",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerContractAddress,
    "end_election",
    targetProposalId
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("endElection end");
      callBack();
    }
  });
}

const voteForProposal = async (callBack: () => void,
  targetProposalId:string,
  yesOrNoString:string
) => {
  console.log("voteForProposal start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const parameter_string = targetProposalId + first_delimiter + yesOrNoString;

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerContractAddress,
    "vote",
    parameter_string
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerContractAddress,
    "vote",
    parameter_string
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("voteForProposal end");
      callBack();
    }
  });
}

const createElection = async (callBack: () => void,
  targetProposalId:string
) => {
  console.log("createElection start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    electionManagerContractAddress,
    "create_election",
    targetProposalId
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    electionManagerContractAddress,
    "create_election",
    targetProposalId
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("createElection end");
      callBack();
    }
  });
}

const createProposalForAddingNewMemeber = async (callBack: () => void) => {
  console.log("createProposalForAddingNewMemeber start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );

  const parameter_string = "2$1$Add Bob$1$I propose to add Bob as a member$1$This is a test$1$https://github.com/realtakahashi/dao_oriented_protocol$1$" +
    memberManagerContractAddress +
    "$1$add_member$1$Bob$2$ZAP5o2BjWAo5uoKDE6b6Xkk4Ju7k6bDu24LNjgZbfM3iyiR";  

  const { gasRequired } = await contract.query.executeInterface(
    deployer.address,
    { value: 0, gasLimit: gasLimit },
    proposalManagerContractAddress,
    "add_proposal",
    parameter_string
  );
  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired },
    proposalManagerContractAddress,
    "add_proposal",
    parameter_string
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("### Transaction is failure.");
      }
      unsub();
      console.log("createProposalForAddingNewMemeber end");
      callBack();
    }
  });
}

const callConfigurePreInstallElectionManager = async (callBack: () => void) => {
  console.log("callConfigurePreInstallElectionManager start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallElection(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallElection({
    value: 0,
    gasLimit: gasRequired,
  });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("callConfigurePreInstallElectionManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallProposalManager = async (callBack: () => void) => {
  console.log("callConfigurePreInstallProposalManager start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallProposalManager(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallProposalManager({
    value: 0,
    gasLimit: gasRequired,
  });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("callConfigurePreInstallProposalManager end");
      callBack();
    }
  });
};

const callConfigurePreInstallMemberManager = async (callBack: () => void) => {
  console.log("callConfigurePreInstallMemberManager start");
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const contract = new ContractPromise(
    api,
    applicationCoreAbi,
    applicationCoreContractAddress
  );
  const { gasRequired } = await contract.query.configurePreInstallMemberManager(
    deployer.address,
    { value: 0, gasLimit: gasLimit }
  );
  const tx = await contract.tx.configurePreInstallMemberManager({
    value: 0,
    gasLimit: gasRequired,
  });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer, ({ events = [], status }) => {
    if (status.isFinalized) {
      if (checkEventsAndInculueError(events) == true) {
        console.log("Transaction is failure.");
      }
      unsub();
      console.log("callConfigurePreInstallMemberManager end");
      callBack();
    }
  });
};

/// deploy functions
const deployMemberManager = async (callBack: () => void) => {
  console.log("Start deployMemberManager");
  // const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  // const api = await ApiPromise.create({ provider: wsProvider });
  // const keyring = new Keyring({ type: "sr25519" });
  // const deployer = keyring.addFromUri("//Alice");

  const contractWasm = memberManagerContract.source.wasm;
  const contract = new CodePromise(api, memberManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit }, "Alice");

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          memberManagerContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployMemberManager");
        callBack();
      }
    }
  );
};

const deployProposalManager = async (callBack: () => void) => {
  console.log("Start deployProposalManager");

  const contractWasm = proposalManagerContract.source.wasm;
  const contract = new CodePromise(api, proposalManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          proposalManagerContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployProposalManager");
        callBack();
      }
    }
  );
};

const deployElectionManager = async (callBack: () => void) => {
  console.log("Start deployElectionManager");

  const contractWasm = electionManagerContract.source.wasm;
  const contract = new CodePromise(api, electionManagerAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new({ gasLimit, storageDepositLimit });

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          electionManagerContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployElectionManager");
        callBack();
      }
    }
  );
};

const deployApplicationCore = async (callBack: () => void) => {
  console.log("Start deployApplicationCore");

  const contractWasm = applicationCoreContract.source.wasm;
  const contract = new CodePromise(api, applicationCoreAbi, contractWasm);
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: 3219235328,
    proofSize: 131072,
  });

  const tx = contract.tx.new(
    { gasLimit, storageDepositLimit },
    memberManagerContractAddress,
    proposalManagerContractAddress,
    electionManagerContractAddress
  );

  //@ts-ignore
  const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
      if (status.isFinalized) {
        if (checkEventsAndInculueError(events)) {
          console.log("Transaction is failure.");
        } else {
          applicationCoreContractAddress = contract.address.toString();
        }
        unsub();
        console.log("End deployApplicationCore");
        callBack();
      }
    }
  );
};

const deployFlipperOrientedDao = async (callBack: () => void) => {
    console.log("Start deployFlipperOrientedDao");

    const contractWasm = flipperOrientedDaoContract.source.wasm;
    const contract = new CodePromise(api, flipperOrientedDaoAbi, contractWasm);
    const gasLimit: any = api.registry.createType("WeightV2", {
      refTime: 3219235328,
      proofSize: 131072,
    });
  
    const tx = contract.tx.new(
      { gasLimit, storageDepositLimit },
      false,
      proposalManagerContractAddress
    );
  
    //@ts-ignore
    const unsub = await tx.signAndSend(deployer,({ events = [], status, contract }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            console.log("Transaction is failure.");
          } else {
            daoOrientedFlipperAddress = contract.address.toString();
          }
          unsub();
          console.log("End deployFlipperOrientedDao");
          callBack();
        }
      }
    );
  };

const checkEventsAndInculueError = (events: any[]): boolean => {
  let ret = false;
  events.forEach(({ event: { data } }) => {
    // console.log("### data.methhod:", data.method);
    if (String(data.method) == "ExtrinsicFailed") {
      console.log("### check ExtrinsicFailed");
      ret = true;
    }
  });
  // console.log("### ret is:", ret);
  return ret;
};

export const getGasLimitForNotDeploy = (api: any): any => {
  const gasLimit: any = api.registry.createType("WeightV2", {
    refTime: new BN("100000000000"),
    proofSize: new BN("100000000000"),
    // refTime: 6219235328,
    // proofSize: 131072,
  });
  return gasLimit;
};

export const executeAllTest = async () => {
  console.log("Start executeAllTest");

  const wsProvider = new WsProvider("ws://127.0.0.1:9944");
  api = await ApiPromise.create({ provider: wsProvider });
  keyring = new Keyring({ type: "sr25519" });
  deployer = keyring.addFromUri("//Alice");

  await test_controller();
  // await deployProposalManager(deployProposalManagerCallBack);
};

const main = () => {
  console.log("Test Start");
  executeAllTest();
};

main();
