//
//  SwapViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/25.
//

import UIKit

class SwapViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()
        
        setLayout()
    }

    @IBAction func onClickNext(_ sender: Any) {
        let vc = ConfirmViewController()
        navigationController?.pushViewController(vc, animated: true)
    }
}

extension SwapViewController {
    private func setLayout() {
        navigationItem.title = "wallet1 (0x1287...dfd)"
    }
}
