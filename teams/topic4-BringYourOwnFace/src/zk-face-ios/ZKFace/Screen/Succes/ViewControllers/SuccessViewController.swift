//
//  SuccessViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/27.
//

import UIKit

class SuccessViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        setLayout()
    }
    
    @IBAction func onClickGoBack(_ sender: Any) {
        navigationController?.popToRootViewController(animated: true)
    }
}

extension SuccessViewController {
    private func setLayout() {
        navigationItem.title = "wallet1 (0x1287...dfd)"
    }
}
