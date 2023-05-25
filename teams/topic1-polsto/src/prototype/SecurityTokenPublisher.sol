// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.0;

import "./SecurityToken.sol";

contract SecurityTokenPublisher {

    struct Submission {
        uint256 submissionNumber;
        // approval details
        address submitter;
        address[] approvers;
        mapping(address => bool) confirms;
        uint8 requiredConfirmCount;
        uint8 confirmCount;
        bool published;

        // token identity
        string tokenName;
        uint8 tokenDecimal;
        string tokenSymbol;
        uint256 tokenTotalSupply;

        // subscribers
        address[] subscribers;
        uint256[] subscriptionAmounts;
        uint256 totalSubscriptionAmount;
    }

    Submission[] public submissions;

    address[] publishedTokens;

    uint256 submitCount = 0;

    function submit(
        address[] memory approvers,
        uint8 requiredConfirmCount,
        string memory tokenName,
        uint8 tokenDecimal,
        string memory tokenSymbol,
        uint256 tokenTotalSupply,
        address[] memory subscribers,
        uint256[] memory subscriptionAmounts
    ) external returns (uint256 submissionNumber) {

        submissionNumber = submitCount;
        Submission storage s = submissions.push();
        s.submissionNumber = submissionNumber;
        s.submitter = msg.sender;
        s.approvers = approvers;
        s.requiredConfirmCount = requiredConfirmCount;
        s.tokenName = tokenName;
        s.tokenDecimal = tokenDecimal;
        s.tokenSymbol = tokenSymbol;
        s.tokenTotalSupply = tokenTotalSupply;
        s.subscribers = subscribers;
        s.subscriptionAmounts = subscriptionAmounts;
        uint256 totalSubscriptionAmount = 0;  // gas saving
        for(uint8 i = 0; i < subscriptionAmounts.length; i++) {
            totalSubscriptionAmount += subscriptionAmounts[i];
        }
        s.totalSubscriptionAmount = totalSubscriptionAmount;
        submitCount ++;
    }

    function confirm(uint256 submissionNumber) external {

        Submission storage s = submissions[submissionNumber];

        require(isApprover(s.approvers, msg.sender), "invalid approver");

        if(!s.confirms[msg.sender]) {
            s.confirms[msg.sender] = true;
            s.confirmCount += 1;
        }

        if(s.confirmCount >= s.requiredConfirmCount) {
            publish(s);
        }
    }

    function publish(Submission storage s) private {
        require(s.published == false, "already published submission");
        
        SecurityToken token = new SecurityToken(
                s.tokenName,
                s.tokenDecimal,
                s.tokenSymbol
            );
            
        address[] memory subscribers = s.subscribers;
        uint256[] memory subscriptionAmounts = s.subscriptionAmounts;
        uint256 totalSubscriptionAmount = s.totalSubscriptionAmount;
        uint256 totalSupply = s.tokenTotalSupply;

        for(uint8 i = 0; i < subscribers.length; i++) {
            token.mint(subscribers[i], subscriptionAmounts[i] * totalSupply / totalSubscriptionAmount);
        }

        publishedTokens.push(address(token));
        s.published = true;
    }

    function isApprover(address[] memory approvers, address addr) private pure returns (bool) {
        for(uint8 i = 0; i < approvers.length; i++) {
            if(approvers[i] == addr) {
                return true;
            }
        }
        return false;
    }

}