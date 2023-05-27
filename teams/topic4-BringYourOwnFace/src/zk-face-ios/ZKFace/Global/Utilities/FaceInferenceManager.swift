//
//  FaceInferenceManager.swift
//  ZKFace
//
//  Created by Danna Lee on 2023/05/19.
//

import Foundation
import CoreML
import UIKit

class FaceInferenceManager {
    class func predict(_ imageArray: MLMultiArray) throws -> MLMultiArray? {
        let model = try vgg_face_model()
        
        print(">>> image Array:", imageArray)
        
        let output = try? model.prediction(zero_padding2d_input: imageArray)
        
        
        print(">>>", output?.Identity.shape)
        
        print(">>>", output?.Identity)
        
        return output?.Identity
    }
    
    class func convertUIImageToMLMultiArray(image: UIImage) -> MLMultiArray? {
        guard let resizedImage = image.resize(newSize: CGSize(width: 224, height: 224)),
              let pixelBuffer = resizedImage.normalized() else {
            // Handle the conversion error
            return nil
        }
        
        guard let multiArray = try? MLMultiArray(shape: [1, 224, 224, 3], dataType: .float32) else {
            // Handle the MLMultiArray creation error
            return nil
        }
        
        let imageChannels = 3
        let imageWidth = 224
        let imageHeight = 224
        
        CVPixelBufferLockBaseAddress(pixelBuffer, .readOnly)
        defer { CVPixelBufferUnlockBaseAddress(pixelBuffer, .readOnly) }
        
        if let baseAddress = CVPixelBufferGetBaseAddress(pixelBuffer) {
            let bufferPointer = baseAddress.assumingMemoryBound(to: UInt8.self)
            
            var pixelIndex = 0
            for row in 0..<imageHeight {
                for col in 0..<imageWidth {
                    let offset = (row * imageWidth + col) * imageChannels
                    
                    for channel in 0..<imageChannels {
                        let pixelValue = bufferPointer[offset + channel]
                        multiArray[pixelIndex] = NSNumber(value: Float32(pixelValue))
                        pixelIndex += 1
                    }
                }
            }
        }
        
        return multiArray
    }
    
    class func calculateCosineSimilarity(_ arrayA: MLMultiArray, _ arrayB: MLMultiArray) -> Double {
        return dot(A: arrayA, B: arrayB) / (magnitude(A: arrayA) * magnitude(A: arrayB))
    }
}

extension FaceInferenceManager {
    private static func dot(A: MLMultiArray, B: MLMultiArray) -> Double {
        var x: Double = 0

        let length = A.count
        for i in 0..<length {
            let aValue = A[i].doubleValue
            let bValue = B[i].doubleValue
            x += aValue * bValue
        }

        return x
    }

    private static func magnitude(A: MLMultiArray) -> Double {
        var x: Double = 0

        let length = A.count
        for i in 0..<length {
            let aValue = A[i].doubleValue
            x += aValue * aValue
        }

        return sqrt(x)
    }
}
