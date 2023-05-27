//
//  VerifyingData.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/27.
//

import Foundation

class ProcessData {
    static let verifyingSteps = ["Detecting your face from the on-chain machine learning model...",
                                 "Generating the Halo2-based ZK Proof to hide your face data...",
                                 "Verifying the Halo2-based ZK Proof...."]
    
    static let sendingSteps = ["Sent: Waiting for origin transaction...",
                               "Finalized: Origin transaction has sufficient confirmations...",
                               "Validated: Validators have signed the message bundle...",
                               "Relayed: Destination transaction has been confirmed..."]
}
