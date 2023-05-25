import Link from "next/link";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { PROPOSAL_FINISHED, PROPOSAL_REJECTED, PROPOSAL_VOTING, ProposalInfo } from "../types/ProposalTypes";
import { AppContext } from "../pages/_app";
import { get_selected_address } from "../api/accountInfoUtils";
import { getProposalList } from "../api/proposal";
import { getElectionCommisionList } from "../api/member";
import ProposalParts from "./ProposalParts";
import ProposalDetails from "./ProposalDetails";

interface ProposalListProps {
  setShowSubmmitButton: (flg: boolean) => void;
  setShowListButton: (flg: boolean) => void;
  setShowList: (flg: boolean) => void;
  setShowSubmitScreen: (flg: boolean) => void;
  showAllList: boolean;
}

const ProposalList = (props: ProposalListProps) => {
  const [proposalList, setProposalList] = useState<Array<ProposalInfo>>();
  const [showList, setShowList] = useState(true);
  const [showListButton, setShowListButton] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [targetProposal, setTargetProposal] = useState<ProposalInfo>({
    id: "0",
    kind: 0,
    title: "",
    outline: "",
    description: "",
    githubUrl: "",
    targetContract: "",
    targetFunction: "",
    parameters: "",
    status: 0,
  });

  const _setShowAndSetTargetProposal = (
    _showList: boolean,
    _showDetails: boolean,
    _showListButton: boolean,
    _backToList: boolean,
    _targetProposal: ProposalInfo
  ) => {
    _setShow(
      _showList,
      _showDetails,
      _showListButton,
      _backToList
    );
    setTargetProposal(_targetProposal);
  };

  const _setShow = (
    _showList: boolean,
    _showDetails: boolean,
    _showListButton: boolean,
    _backToList: boolean
  ) => {
    setShowList(_showList);
    _getProposalList();
    setShowListButton(_showListButton);
    setShowDetails(_showDetails);
    if (_backToList) {
      props.setShowSubmmitButton(true);
      props.setShowList(true);
      props.setShowListButton(false);
      props.setShowSubmitScreen(false);
    } else {
      props.setShowSubmmitButton(false);
    }
  };

  const {api} = useContext(AppContext);
  
  const _getProposalList = async () => {
    const selectedAddress = get_selected_address();
    const result = await getProposalList(api, selectedAddress);
    setProposalList(result);
  };



  useEffect(() => {
    _getProposalList();
  }, []);

  return (
    <>
      {showListButton == true && (
        <div className="flex justify-center">
          <button
            className="m-2 px-4 py-2  border-black border-2 bg-white rounded text-black  hover:bg-green-200"
            onClick={() => _setShow(true, false, false, true)}
          >
            Back To List
          </button>
        </div>
      )}
      <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
        {showList == true && (
          <>
            {typeof proposalList !== "undefined"
              ? proposalList.map((proposal) => {
                  return (
                    <div key={proposal.title}>
                      {(props.showAllList == true ||
                        (props.showAllList == false &&
                          proposal.status != PROPOSAL_FINISHED &&
                          props.showAllList == false &&
                          proposal.status != PROPOSAL_REJECTED)) && (
                        <div className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                          <ProposalParts
                            targetProposal={proposal}
                          ></ProposalParts>
                          <div className="px-6 py-4">
                            <button className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                              <Link href={proposal.githubUrl}>
                                Website
                                {/* <a target={"_blank"} rel="noopener noreferrer">
                                  Website
                                </a> */}
                              </Link>
                            </button>
                              <button
                                className="inline-block bg-green-700 rounded-full px-3 py-1 text-sm font-semibold text-white mr-2 mb-2"
                                onClick={() =>
                                  _setShowAndSetTargetProposal(
                                    false,
                                    true,
                                    true,
                                    false,
                                    proposal
                                  )
                                }
                              >
                                Details
                              </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              : ""}
          </>
        )}
      </div>
      <div>
        {showDetails == true && <ProposalDetails targetProposal={targetProposal}></ProposalDetails>}
      </div>
    </>
  );
};

export default ProposalList;
