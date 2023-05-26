import { useState } from "react";
import { useEffect, useContext } from "react";
import Link from "next/link";
import { AppContext } from "../../pages/_app";
import { ElectionInfo } from "../../types/ElectionTypes";
import { get_selected_address } from "../../api/accountInfoUtils";
import { getElectionCommisionList, getMemberList } from "../../api/member";
import { getElectionList } from "../../api/election";

const ElectionList = () => {
  const [electionList, setElectionList] = useState<Array<ElectionInfo>>();
  const { api } = useContext(AppContext);

  const _getElectionList = async () => {
    const selectedAddress = get_selected_address();
    const electionList = await getElectionList(api, selectedAddress);
    console.log("## electionList:", electionList);
    setElectionList(electionList);
  };

  useEffect(() => {
    _getElectionList();
  }, []);

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href="/start">Back to Top</Link>
        </div>
        <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
          {typeof electionList !== "undefined"
            ? electionList.map((election) => {
                return (
                  <div key={election.id}>
                    {/* {election.id != "" && ( */}
                      <div className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                        <div className="px-6 py-4">
                          <div className="font-bold mb-2 text-white">
                            Id: {election.id}
                          </div>
                          <p className="p-3 text-white text-base">
                            Proposal Id: {election.proposalId}
                          </p>
                          <p className="p-3 text-white text-base">
                            Voter Turnout Percentage:{" "}
                            {election.minimumVoterTurnoutPercentage}
                          </p>
                          <p className="p-3 text-white text-base">
                            Passing Percentage: {election.passingPercentage}
                          </p>
                          <p className="p-3 text-white text-base">
                            Number Of Votes: {election.numberOfVotes}
                          </p>
                          <p className="p-3 text-white text-base">
                            Count Of Yes: {election.countOfYes}
                          </p>
                          <p className="p-3 text-white text-base">
                            Count Of No: {election.countOfNo}
                          </p>
                          <p className="p-3 text-white text-base">
                            Voters: {election.listOfVoters}
                          </p>
                          <p className="p-3 text-white text-base">
                            ElectoralCommissioner:{" "}
                            {election.listOfElectoralCommissioner}
                          </p>
                          <p className="p-3 text-white text-base">
                            Is Passed: {String(election.isPassed)}
                          </p>
                        </div>
                      </div>
                    {/* )} */}
                    ;
                  </div>
                );
              })
            : ""}
        </div>
      </div>
    </>
  );
};

export default ElectionList;
