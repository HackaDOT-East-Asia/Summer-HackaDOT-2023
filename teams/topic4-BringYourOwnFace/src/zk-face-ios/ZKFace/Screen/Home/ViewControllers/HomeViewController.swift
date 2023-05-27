//
//  HomeViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/25.
//

import UIKit

class HomeViewController: UIViewController {

    override func viewDidLoad() {
        super.viewDidLoad()

        setLayout()
    }
    
    @IBAction func onClickSend(_ sender: Any) {
        let vc = SwapViewController()
        navigationController?.pushViewController(vc, animated: true)
    }
}

extension HomeViewController {
    private func setLayout() {
        navigationItem.title = "wallet1 (0x1287...dfd)"
    }
}
