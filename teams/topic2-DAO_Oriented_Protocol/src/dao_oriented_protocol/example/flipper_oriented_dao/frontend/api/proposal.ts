import { ContractPromise } from "@polkadot/api-contract";
import ApplicationCoreAbi from "../contract_abi/application_core.json";
import {
  checkEventsAndInculueError,
  getGasLimitForNotDeploy,
} from "./apiUtils";
import {
  PROPOSAL_FINISHED,
  PROPOSAL_FINISH_VOTING,
  PROPOSAL_KIND,
  PROPOSAL_STATUS,
  PROPOSAL_VOTING,
  ProposalInfo,
} from "../types/ProposalTypes";
import type { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";

const applicationCoreAddress =
  String(process.env.NEXT_PUBLIC_APPLICATION_CORE_CONTRACT_ADDRESS) ?? "";
const defaultElectionAddress =
  String(process.env.NEXT_PUBLIC_DEFAULT_ELECTION_CONTRACT_ADDRESS) ?? "";
const defaultProposalAddress =
  String(process.env.NEXT_PUBLIC_DEFAULT_PROPOSAL_CONTRACT_ADDRESS) ?? "";

const storageDepositLimit = null;

export const getProposalList = async (
  api: any,
  peformanceAddress: string
): Promise<Array<ProposalInfo>> => {
  let response: ProposalInfo[] = [];
  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.getProposalInfoList(
    peformanceAddress,
    {
      value: 0,
      gasLimit: gasLimit,
    }
  );
  if (output !== undefined && output !== null) {
    console.log("getProposalList:output:",output?.toJSON());
    let response_json = output?.toJSON().ok;
    let json_data = JSON.parse(JSON.stringify(response_json));
    for (let i = 0; i < json_data.length; i++) {
      let item: ProposalInfo = {
        id: json_data[i].id,
        kind: getProposalKind(json_data[i].kind),
        title: json_data[i].title,
        outline: json_data[i].outline,
        description: json_data[i].description,
        githubUrl: json_data[i].githubUrl,
        targetContract: json_data[i].targetContract,
        targetFunction: json_data[i].targetFunction,
        parameters: json_data[i].parameters,
        status: getProposalStatus(json_data[i].status),
      };
      response.push(item);
    }
  }
  return response;
};

export const getProposalKind = (kindString:string):number => {
  for (let i=0; i<PROPOSAL_KIND.length; i++){
    if (kindString == PROPOSAL_KIND[i]){
      return i;
    }
  }
  return 0;
}

export const getProposalStatus = (statusString:string):number => {
  for (let i=0; i<PROPOSAL_STATUS.length; i++){
    if (statusString == PROPOSAL_STATUS[i]){
      return i;
    }
  }
  return 0;
}

export const checkElectionCommisioner = async (
  api:any,
  peformanceAddress: string
): Promise<boolean> => {
  let res = false;
  const contract = new ContractPromise(api, ApplicationCoreAbi, applicationCoreAddress);
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const { output } = await contract.query.checkElectionCommisioner(peformanceAddress, {
    value: 0,
    gasLimit: gasLimit,
  });
  if (output !== undefined && output !== null) {
    console.log("checkElectionCommisioner: output: ", output.toHuman());
    res = Boolean(output.toHuman().Ok) ?? false;
  }
  return res;
};

export const voteForProposal = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  yesOrNo: string,
  proposalId: number
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const injector = await web3FromSource(performingAccount.meta.source);
  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    defaultElectionAddress,
    "vote",
    String(proposalId) + "$1$" + yesOrNo
  );

  if (output?.toHuman()?.Ok.Err != undefined) {
    if (output?.toHuman()?.Ok.Err.Custom != undefined) {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.Custom);
    } else {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    defaultElectionAddress,
    "vote",
    String(proposalId) + "$1$" + yesOrNo
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const changeProposalStatus = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  proposalStatus: number,
  proposalId: number
) => {
  if (proposalStatus == PROPOSAL_VOTING) {
    await createElection(api, performingAccount, proposalId);
  } else if (proposalStatus == PROPOSAL_FINISH_VOTING) {
    await endElection(api, performingAccount, proposalId);
  } else {
    alert("This is bug.");
  }
};

export const createElection = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  proposalId: number
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const injector = await web3FromSource(performingAccount.meta.source);
  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    defaultElectionAddress,
    "create_election",
    String(proposalId)
  );

  if (output?.toHuman()?.Ok.Err != undefined) {
    if (output?.toHuman()?.Ok.Err.Custom != undefined) {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.Custom);
    } else {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    defaultElectionAddress,
    "create_election",
    String(proposalId)
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const endElection = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  proposalId: number
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const injector = await web3FromSource(performingAccount.meta.source);
  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    defaultElectionAddress,
    "end_election",
    String(proposalId)
  );

  if (output?.toHuman()?.Ok.Err != undefined) {
    if (output?.toHuman()?.Ok.Err.Custom != undefined) {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.Custom);
    } else {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    defaultElectionAddress,
    "end_election",
    String(proposalId)
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

export const executeProposal = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  proposalId: number
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  const injector = await web3FromSource(performingAccount.meta.source);
  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    defaultProposalAddress,
    "execute_proposal",
    String(proposalId)
  );

  if (output?.toHuman()?.Ok.Err != undefined) {
    if (output?.toHuman()?.Ok.Err.Custom != undefined) {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.Custom);
    } else {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    defaultProposalAddress,
    "execute_proposal",
    String(proposalId)
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};

const DELIMITER = "$1$";

export const submitProposal = async (
  api: any,
  performingAccount: InjectedAccountWithMeta,
  proposalInfo: ProposalInfo
) => {
  const { web3FromSource } = await import("@polkadot/extension-dapp");

  const contract = new ContractPromise(
    api,
    ApplicationCoreAbi,
    applicationCoreAddress
  );
  const gasLimit: any = getGasLimitForNotDeploy(api);

  console.log("submitProposal:proposalInfo",proposalInfo);

  const params =
    String(proposalInfo.kind) +
    DELIMITER +
    proposalInfo.title +
    DELIMITER +
    proposalInfo.outline +
    DELIMITER +
    proposalInfo.description +
    DELIMITER +
    proposalInfo.githubUrl +
    DELIMITER +
    proposalInfo.targetContract +
    DELIMITER +
    proposalInfo.targetFunction +
    DELIMITER +
    proposalInfo.parameters;

  const injector = await web3FromSource(performingAccount.meta.source);
  const { output, gasRequired } = await contract.query.executeInterface(
    performingAccount.address,
    { value: 0, gasLimit: gasLimit, storageDepositLimit },
    defaultProposalAddress,
    "add_proposal",
    params
  );

  if (output?.toHuman()?.Ok.Err != undefined) {
    if (output?.toHuman()?.Ok.Err.Custom != undefined) {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.Custom);
    } else {
      alert("Error is occured: " + output?.toHuman()?.Ok.Err.toHuman());
    }
    return;
  }

  const tx = await contract.tx.executeInterface(
    { value: 0, gasLimit: gasRequired, storageDepositLimit },
    defaultProposalAddress,
    "add_proposal",
    params
  );
  if (injector !== undefined) {
    const unsub = await tx.signAndSend(
      performingAccount.address,
      { signer: injector.signer },
      ({ status, events = [] }) => {
        if (status.isFinalized) {
          if (checkEventsAndInculueError(events)) {
            alert("Transaction is failure.");
          }
          unsub();
        }
      }
    );
  }
};
