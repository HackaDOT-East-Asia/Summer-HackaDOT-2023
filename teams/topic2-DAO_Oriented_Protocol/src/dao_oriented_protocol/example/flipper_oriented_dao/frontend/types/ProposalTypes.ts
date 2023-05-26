export interface ProposalInfo {
  id: string;
  kind: number;
  title: string;
  outline: string;
  description: string;
  githubUrl: string;
  targetContract: string;
  targetFunction: string;
  parameters: string;
  status: number;
}

export interface ProposalProps {
  targetProposal: ProposalInfo;
}

export const PROPOSAL_KIND = [
  "None",
  "ResetElectionCommisioner",
  "Other",
] as const;

export const PROPOSAL_STATUS = [
  "None",
  "Proposed",
  "Voting",
  "FinishVoting",
  "Executed",
  "Denied",
  "Finished",
] as const;

export const PROPOSAL_VOTING = 2;
export const PROPOSAL_FINISHED = 6;
export const PROPOSAL_REJECTED = 5;
export const PROPOSAL_EXECUTED = 4;
export const PROPOSAL_FINISH_VOTING = 3;
