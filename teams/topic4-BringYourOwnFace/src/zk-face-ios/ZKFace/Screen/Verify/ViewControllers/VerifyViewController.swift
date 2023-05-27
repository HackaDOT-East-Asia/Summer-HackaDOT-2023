//
//  VerifyViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/27.
//

import UIKit

class VerifyViewController: UIViewController {
    
    private let type: ProcessType
    private var currentStep: Int = 0
    private var timer: Timer?

    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var descLabel: UILabel!
    
    @IBOutlet weak var processCollectionView: UICollectionView!
    
    init(type: ProcessType) {
        self.type = type
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()

        setLayout()
        register()
        startNextProcess()
    }

}

extension VerifyViewController {
    private func setLayout() {
        navigationItem.title = "wallet1 (0x1287...dfd)"
        
        if type == .sending {
            titleLabel.text = "Sending..."
            descLabel.text = "You are now using Hyperlane protocol by default"
        }
    }
    
    fileprivate func register() {
        processCollectionView.dataSource = self
        processCollectionView.delegate = self
        processCollectionView.register(UINib(nibName: VerifySendProcessCell.identifier, bundle: nil), forCellWithReuseIdentifier: VerifySendProcessCell.identifier)
    }
    
    private func startNextProcess() {
        let randomDelay = Double.random(in: 0...3)
        timer = Timer.scheduledTimer(timeInterval: randomDelay, target: self, selector: #selector(incrementCurrentStep), userInfo: nil, repeats: false)
    }
    
    @objc private func incrementCurrentStep() {
        currentStep += 1
        
        processCollectionView.reloadData()
        
        let maxStep = type == .verifying ? ProcessData.verifyingSteps.count : ProcessData.sendingSteps.count
        
        if currentStep < maxStep {
            self.startNextProcess()
        } else {
            self.moveToNextVC()
        }
    }
    
    private func moveToNextVC() {
        switch type {
        case .verifying:
            let vc = VerifyViewController(type: .sending)
            navigationController?.pushViewController(vc, animated: true)
        case .sending:
            let vc = SuccessViewController()
            navigationController?.pushViewController(vc, animated: true)
        }
    }
}

extension VerifyViewController: UICollectionViewDataSource {
    func collectionView(_ collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        switch type {
        case .verifying:
            return ProcessData.verifyingSteps.count
        case .sending:
            return ProcessData.sendingSteps.count
        }
    }
    
    func collectionView(_ collectionView: UICollectionView, cellForItemAt indexPath: IndexPath) -> UICollectionViewCell {
        guard let cell = collectionView.dequeueReusableCell(withReuseIdentifier: VerifySendProcessCell.identifier, for: indexPath) as? VerifySendProcessCell else { return UICollectionViewCell() }
        
        switch type {
        case .verifying:
            cell.setData(process: ProcessData.verifyingSteps[indexPath.item])
        case .sending:
            cell.setData(process: ProcessData.sendingSteps[indexPath.item])
        }
        
        if indexPath.item < currentStep {
            cell.setLoading(false)
        } else {
            cell.setLoading(true)
        }
        
        return cell
    }
}

extension VerifyViewController: UICollectionViewDelegateFlowLayout {
    func collectionView(_ collectionView: UICollectionView, layout collectionViewLayout: UICollectionViewLayout, sizeForItemAt indexPath: IndexPath) -> CGSize {
        return CGSize(width: collectionView.frame.width, height: 96)
    }
}
