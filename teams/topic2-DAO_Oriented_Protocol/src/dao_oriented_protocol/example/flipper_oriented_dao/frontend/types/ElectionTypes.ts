export interface ElectionInfo {
    id: string,
    proposalId: string,
    minimumVoterTurnoutPercentage: string,
    passingPercentage: string,
    numberOfVotes: string,
    countOfYes: string,
    countOfNo: string,
    listOfVoters: Array<string>,
    listOfElectoralCommissioner: Array<string>,
    isPassed: string,
}
