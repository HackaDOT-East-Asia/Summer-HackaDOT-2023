import { useState } from "react";
import { useEffect, useContext } from "react";
import Link from "next/link";
import { AppContext } from "../../pages/_app";
import { get_selected_address } from "../../api/accountInfoUtils";
import { getElectionCommisionList, getMemberList } from "../../api/member";
import { SoftwareInfo } from "../../types/SoftwareTypes";
import { getPreSoftwareList, getSoftwareList } from "../../api/software";

const SoftwareList = () => {
  const [softwareList, setSoftwareList] = useState<Array<SoftwareInfo>>();
  const { api } = useContext(AppContext);

  const _getSoftwareList = async () => {
    const selectedAddress = get_selected_address();
    const normalList = await getSoftwareList(api, selectedAddress);
    console.log("## normalList:", normalList);
    const preList = await getPreSoftwareList(api, selectedAddress);
    console.log("## preList:", preList);
    let result: SoftwareInfo[] = normalList.concat(preList);
    setSoftwareList(result);
  };

  useEffect(() => {
    _getSoftwareList();
  }, []);

  return (
    <>
      <div className="bg-black flex flex-col min-h-screen">
        <div className="m-5 text-25px text-left text-white underline leading-none tracking-tight">
          <Link href="/start">Back to Top</Link>
        </div>
        <div className="p-2 flex flex-wrap justify-center mx-1 lg:-mx-4">
          {typeof softwareList !== "undefined"
            ? softwareList.map((software) => {
                return (
                  <div key={software.name}>
                    {software.name != "" && (
                      <div className="m-5  max-w-sm rounded overflow-hidden shadow-lg bg-black border-4 border-white">
                        <div className="px-6 py-4">
                          <div className="font-bold mb-2 text-white">
                            Name: {software.name}
                          </div>
                          <p className="text-white text-base">
                            Id: {String(software.id)}
                          </p>
                          <p className="text-white text-base">
                            Kind: {String(software.kind)}
                          </p>
                          <p className="text-white text-base">
                            Type: {String(software.softwareType)}
                          </p>
                          <p className="text-white text-base">
                            Contract Address: {String(software.contractAddress)}
                          </p>
                          <p className="text-white text-base">
                            Description: {String(software.description)}
                          </p>
                        </div>
                      </div>
                    )}
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

export default SoftwareList;
