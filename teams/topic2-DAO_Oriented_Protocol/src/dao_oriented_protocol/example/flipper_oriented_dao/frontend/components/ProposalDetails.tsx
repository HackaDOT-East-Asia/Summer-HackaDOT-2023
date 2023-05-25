import { useState, useContext, useEffect } from "react";
import {
  PROPOSAL_EXECUTED,
  PROPOSAL_KIND,
  PROPOSAL_STATUS,
  PROPOSAL_VOTING,
  ProposalProps,
} from "../types/ProposalTypes";
import {
  get_account_info,
  get_selected_address,
} from "../api/accountInfoUtils";
import { AppContext } from "../pages/_app";
import { getElectionCommisionList } from "../api/member";
import {
  changeProposalStatus,
  checkElectionCommisioner,
  executeProposal,
  voteForProposal,
} from "../api/proposal";

const ProposalDetails = (props: ProposalProps) => {
  const [voteStatus, setVoteStatus] = useState("no");
  const [changeStatus, setChangeStatus] = useState("0");
  const [isElectionCommition, setIsElectionCommition] = useState(false);
  const { api } = useContext(AppContext);

  const selectVoteStatus = (status: string) => {
    setVoteStatus(status);
  };
  const selectChangeStatus = (status: string) => {
    setChangeStatus(status);
  };

  const doVote = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    await voteForProposal(
      api,
      selectedAccount,
      voteStatus,
      Number(props.targetProposal.id)
    );
  };

  const doChangeStatus = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    await changeProposalStatus(
      api,
      selectedAccount,
      Number(changeStatus),
      Number(props.targetProposal.id)
    );
  };

  const _executeProposal = async () => {
    const selectedAccount = await get_account_info(get_selected_address());
    await executeProposal(
      api,
      selectedAccount,
      Number(props.targetProposal.id)
    );
  };

  const _isElectionCommition = async () => {
    const selectedAddress = get_selected_address();
    const ret = await checkElectionCommisioner(api, selectedAddress);
    setIsElectionCommition(ret);
  };
  useEffect(() => {
    _isElectionCommition();
  }, []);

  return (
    <>
      <div className="flex flex-col">
        {/* <div
          className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white"
          key={props.targetProposal.title}
        > */}
          <div className="px-6 py-4 text-center">
            <div className="text-20px font-bold mb-2 text-white">
              {props.targetProposal.title}
            </div>
            <p className="p-1 text-white text-base">
              Id: {String(props.targetProposal.id)}
            </p>
            <p className="p-1 text-white text-base">
              Kind: {PROPOSAL_KIND[props.targetProposal.kind]}
            </p>
            <p className="p-1 text-white text-base">
              Status: {PROPOSAL_STATUS[props.targetProposal.status]}
            </p>
            <p className="p-1 text-white text-base">
              Outline: {props.targetProposal.outline}
            </p>
            <p className="p-1 text-white text-base">
              Description: {props.targetProposal.description}
            </p>
            <p className="p-1 text-white text-base">
              Github URL: {props.targetProposal.githubUrl}
            </p>
            <p className="p-1 text-white text-base">
              Target Contract: {props.targetProposal.targetContract}
            </p>
            <p className="p-1 text-white text-base">
              Target Function: {props.targetProposal.targetFunction}
            </p>
            <p className="p-1 text-white text-base">
              Parameters: {props.targetProposal.parameters}
            </p>
          </div>
          <div className="text-center">
            {props.targetProposal.status == PROPOSAL_VOTING && (
              <>
                <label className="text-18px text-blue-400 px-7 py-5">
                  You Vote For :
                </label>
                <select
                  className="font-bold"
                  name="Status"
                  value={voteStatus}
                  onChange={(e) => selectVoteStatus(e.target.value)}
                >
                  <option value="yes">YES</option>
                  <option value="no">NO</option>
                </select>
                <button
                  className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
                  onClick={() => doVote()}
                >
                  Vote
                </button>
              </>
            )}
          </div>
          <div className="text-center">
            {isElectionCommition == true && (
              <>
                <label className="text-15px text-blue-400 px-4 py-5">
                  Proposal Status Change To :
                </label>
                <select
                  className="font-bold"
                  name="Status"
                  value={changeStatus}
                  onChange={(e) => selectChangeStatus(e.target.value)}
                >
                  <option value="0"></option>
                  <option value="2">Voting</option>
                  <option value="3">FinishVoting</option>
                </select>
                <button
                  className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
                  onClick={() => doChangeStatus()}
                >
                  Change
                </button>
              </>
            )}
          </div>
          <div className="text-center">
            {props.targetProposal.status == PROPOSAL_EXECUTED && (
              <>
                <button
                  className="m-2 px-4 py-2  border-black border-2 bg-blue-200 rounded text-black  hover:bg-green-200"
                  onClick={() => _executeProposal()}
                >
                  Execute Proposal
                </button>
              </>
            )}
          </div>
        {/* </div> */}
      </div>
    </>
  );
};

export default ProposalDetails;
