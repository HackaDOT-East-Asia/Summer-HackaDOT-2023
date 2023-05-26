import {
    PROPOSAL_KIND,
    PROPOSAL_STATUS,
    ProposalProps,
  } from "../types/ProposalTypes";
  
  const ProposalParts = (props: ProposalProps) => {
    return (
      <div className="px-6 py-4">
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
      </div>
    );
  };
  
  export default ProposalParts;