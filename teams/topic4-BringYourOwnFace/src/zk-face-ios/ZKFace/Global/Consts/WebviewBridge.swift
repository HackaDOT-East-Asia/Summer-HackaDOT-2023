//
//  webviewBridge.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/20.
//

import Foundation

enum IosWebBridgeType: String {
    case doneFaceRecognition
}

enum WebIosBridgeType: String {
    // main
    case onClickImportYourWallet, onClickCreateNewWallet
    
    //
    case onClickSend
    
    //
    case onClickNext
    
    //
    case onClickConfirm
}
