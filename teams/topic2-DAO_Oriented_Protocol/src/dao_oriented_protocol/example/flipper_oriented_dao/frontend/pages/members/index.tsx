import { useState } from "react";
import { useEffect, useContext } from "react";
import Link from "next/link";
import {AppContext} from "../../pages/_app";
import { MemberInfoPlus } from "../../types/MemberTypes";
import { get_selected_address } from "../../api/accountInfoUtils";
import { getElectionCommisionList, getMemberList } from "../../api/member";


const MemberList = () => {
  const [memberList, setMemberList] = useState<Array<MemberInfoPlus>>();
  const {api} = useContext(AppContext);

  const _getMemberList = async () => {
    const selectedAddress = get_selected_address();
    const memberList = await getMemberList(api, selectedAddress);
    console.log("## memberList:",memberList);
    const electionCommisionList = await getElectionCommisionList(api, selectedAddress);
    console.log("## electionCommisionList:",electionCommisionList);
    let result: MemberInfoPlus[] = [];
    for (let i=0; i<memberList.length; i++){
        let isElectionCommition = false;
        for (let j=0; j<electionCommisionList.length; j++){
            if (memberList[i].eoaAddress == electionCommisionList[j].eoaAddress) {
                isElectionCommition = true;
                break;
            }
        }
        let item: MemberInfoPlus = {
            eoaAddress: memberList[i].eoaAddress,
            name: memberList[i].name,
            memberId: memberList[i].memberId,
            isElectionCommition : isElectionCommition,
        };
        result.push(item);
    }
    setMemberList(result);
  };

  useEffect(() => {
    _getMemberList();
  }, []);


  return (
    <>
        <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href="/start">Back to Top</Link>
        </div>
        <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
          {typeof memberList !== "undefined"
            ? memberList.map((member) => {
                return (
                  <div key={member.name}>
                  {member.name!="" &&(
                    
                <div
                    className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                    <div className="px-6 py-4">
                      <div className="font-bold mb-2 text-white">
                        Name: {member.name}
                      </div>
                      {member.isElectionCommition == true && (
                        <p className="text-orange-400 font-bold text-14px">
                          Election Comission
                        </p>
                      )}
                      <p className="text-white text-base">
                        Member Id: {String(member.memberId)}
                      </p>
                      <p className="text-white text-base">Address:</p>
                      <p className="text-gray-400 text-12px">
                        {member.eoaAddress}
                      </p>
                    </div>
                    </div>
                    )};
                  </div>
                );
              })
            : ""}
        </div>
        </div>
    </>
  );
};

export default MemberList;