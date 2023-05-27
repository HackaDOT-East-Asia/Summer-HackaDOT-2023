//
//  VerifySendProcessCell.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/27.
//

import UIKit

class VerifySendProcessCell: UICollectionViewCell {
    
    static let identifier = String(describing: VerifySendProcessCell.self)

    @IBOutlet weak var checkImageView: UIImageView!
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    @IBOutlet weak var processDescLabel: UILabel!
    
    override func awakeFromNib() {
        super.awakeFromNib()
        
        activityIndicator.color = .black
    }

}

extension VerifySendProcessCell {
    func setData(process: String) {
        processDescLabel.text = process
    }
    
    func setLoading(_ isLoading: Bool) {
        if isLoading {
            checkImageView.isHidden = true
            activityIndicator.isHidden = false
            activityIndicator.startAnimating()
        } else {
            checkImageView.isHidden = false
            activityIndicator.stopAnimating()
        }
    }
}
