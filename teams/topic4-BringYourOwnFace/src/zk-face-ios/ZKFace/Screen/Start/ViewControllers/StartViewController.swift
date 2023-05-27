//
//  StartViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/25.
//

import UIKit

class StartViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        // Do any additional setup after loading the view.
    }
    
    @IBAction func onClickCreateWallet(_ sender: Any) {
        moveToFaceRecognitionView()
    }
    
    @IBAction func onClickImportWallet(_ sender: Any) {
        moveToFaceRecognitionView()
    }
}

extension StartViewController {
    private func moveToFaceRecognitionView() {
        let vc = FaceCameraViewController(type: .wallet)
        vc.modalPresentationStyle = .fullScreen
        present(vc, animated: true)
    }
}
