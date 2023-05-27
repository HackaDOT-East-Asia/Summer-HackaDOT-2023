//
//  ViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/19.
//

import UIKit
import CoreML

class ViewController: UIViewController {
    
    let imagePickerController = UIImagePickerController()
    
    var identities: [MLMultiArray] = []

    @IBOutlet weak var photoImageView: UIImageView!
    @IBOutlet weak var pickPhotoButton: UIButton!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
    }
    
    @IBAction func onClickPickPhoto(_ sender: Any) {
        let imagePickerController = UIImagePickerController()
        imagePickerController.delegate = self
        
        let alertController = UIAlertController(title: "Select Image", message: nil, preferredStyle: .actionSheet)
        
        alertController.addAction(UIAlertAction(title: "Camera", style: .default) { _ in
            imagePickerController.sourceType = .camera
            self.present(imagePickerController, animated: true, completion: nil)
        })
        
        alertController.addAction(UIAlertAction(title: "Photo Library", style: .default) { _ in
            imagePickerController.sourceType = .photoLibrary
            self.present(imagePickerController, animated: true, completion: nil)
        })
        
        alertController.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
        
        present(alertController, animated: true, completion: nil)
    }
}

extension ViewController: UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey: Any]) {
        dismiss(animated: true, completion: nil)
        
        if let image = info[.originalImage] as? UIImage {
            photoImageView.image = image
            
            guard let imageArray = FaceInferenceManager.convertUIImageToMLMultiArray(image: image) else { return }
            guard let identity = try? FaceInferenceManager.predict(imageArray) else { return }
            
            identities.append(identity)
            
            if identities.count >= 2 {
                let cosineSimilarity = FaceInferenceManager.calculateCosineSimilarity(identity, identities[identities.count-2])
                print("similarity:", cosineSimilarity)
            }
        }
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        dismiss(animated: true, completion: nil)
    }
}
