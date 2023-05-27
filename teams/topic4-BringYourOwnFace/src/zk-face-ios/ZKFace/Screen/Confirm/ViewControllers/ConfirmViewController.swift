//
//  ConfirmViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/25.
//

import UIKit

class ConfirmViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        setLayout()
    }

    @IBAction func onClickConfirm(_ sender: Any) {
        let vc = FaceCameraViewController(type: .transaction)
        vc.parentVC = self
        present(vc, animated: true)
    }
}

extension ConfirmViewController {
    private func setLayout() {
        navigationItem.title = "wallet1 (0x1287...dfd)"
    }
}
