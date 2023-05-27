//
//  FaceCameraViewController.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/20.
//

import UIKit
import AVFoundation

class FaceCameraViewController: UIViewController {
    
    let faceRecognitionType: FaceRecognitionType
    
    var captureSession: AVCaptureSession?
    var photoOutput: AVCapturePhotoOutput?
    var videoPreviewLayer: AVCaptureVideoPreviewLayer?
    
    var parentVC: UIViewController?
    
    @IBOutlet weak var activityIndicator: UIActivityIndicatorView!
    
    init(type: FaceRecognitionType) {
        self.faceRecognitionType = type
        
        super.init(nibName: nil, bundle: nil)
    }
    
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        
        setLayout()
        setCamera()
    }
    
    @IBAction func onClickShot(_ sender: Any) {
        photoOutput?.capturePhoto(with: AVCapturePhotoSettings(), delegate: self as AVCapturePhotoCaptureDelegate)
        setLoading(true)
    }
}

extension FaceCameraViewController {
    private func setLayout() {
        modalPresentationStyle = .fullScreen
    }
    
    private func setCamera() {
        captureSession = AVCaptureSession()
        captureSession?.beginConfiguration()
        
        guard let captureDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: .front) else { return }
        
        do {
            let cameraInput = try AVCaptureDeviceInput(device: captureDevice)
            
            photoOutput = AVCapturePhotoOutput()
            
            captureSession?.addInput(cameraInput)
            captureSession?.sessionPreset = .photo
            captureSession?.addOutput(photoOutput!)
            captureSession?.commitConfiguration()
        } catch {
            print(error)
        }
        
        //preview
        videoPreviewLayer = AVCaptureVideoPreviewLayer(session: captureSession!)
        DispatchQueue.main.async {
            self.videoPreviewLayer?.frame = self.view.bounds
        }
        videoPreviewLayer?.videoGravity = .resizeAspectFill
        self.view.layer.insertSublayer(videoPreviewLayer!, at: 0)
        
        DispatchQueue.global(qos: .userInitiated).async {
            self.captureSession?.startRunning()
        }
    }
    
    private func moveToNextVC() {
        switch faceRecognitionType {
        case .wallet:
            let vc = ByofTabBarController()
            vc.modalPresentationStyle = .fullScreen
            present(vc, animated: false)
        case .transaction:
            dismiss(animated: true) {
                if let parentVC = self.parentVC {
                    parentVC.navigationController?.pushViewController(VerifyViewController(type: .verifying), animated: true)
                }
            }
        }
        
    }
    
    private func setLoading(_ isLoading: Bool) {
        if isLoading {
            activityIndicator.isHidden = false
            activityIndicator.startAnimating()
        } else {
            activityIndicator.stopAnimating()
        }
    }
}

extension FaceCameraViewController: AVCapturePhotoCaptureDelegate {
    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        guard let imageData = photo.fileDataRepresentation() else { return }
        guard let image = UIImage(data: imageData) else { return }
        
        captureSession?.stopRunning()
        
        if faceRecognitionType == .wallet {
            guard let imageArray = FaceInferenceManager.convertUIImageToMLMultiArray(image: image) else { return }
            
            _ = try? FaceInferenceManager.predict(imageArray)
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 3) {
            self.setLoading(false)
            self.moveToNextVC()
        }
    }
}
