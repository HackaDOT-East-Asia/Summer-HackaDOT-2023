import numpy as np
from deepface import DeepFace
from bridge import poseidon_hash, evm_prove
from utility import bytearray_to_hex, hex_to_bytearray, \
    fuzzy_commitment, my_hash, recover, generate_proof
from convert import feat_bytearray_from_image_path


class FaceComparison:

    @staticmethod
    def verify_faces(img1_path, img2_path):
        """Verify if two faces are the same"""
        result = DeepFace.verify(img1_path, img2_path)
        return result

    @staticmethod
    def represent_face(img_path):
        """Get the face embeddings for the image at img_path"""
        embedding = DeepFace.represent(img_path)
        return embedding

    @staticmethod
    def calculate_distance(embedding1, embedding2):
        """Calculate Euclidean distance between two embeddings"""
        a = np.array(embedding1)
        b = np.array(embedding2)
        dist = np.linalg.norm(a - b)
        return dist

    @staticmethod
    def calculate_cosine_similarity(embedding1, embedding2):
        """Calculate Cosine similarity between two embeddings"""
        a = np.array(embedding1)
        b = np.array(embedding2)
        cos_sim = np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))
        return 1 - cos_sim

    # curl -X POST -H "Content-Type: application/json" -d '{"img_path":"/Users/sigridjin.eth/Documents/github/zk-face-circuit/backend/backend/dataset/img2.jpg"}' http://127.0.0.1:5000/feat_vec
    @staticmethod
    def feat_vec(img_path):
        feat = feat_bytearray_from_image_path(img_path)
        print('bytearray_to_hex(feat)', bytearray_to_hex(feat))

        feat_xor_ecc, hash_ecc = fuzzy_commitment(feat)
        hash_feat_xor_ecc = my_hash(feat_xor_ecc)

        return {
            "feat": bytearray_to_hex(feat),
            "hash_ecc": bytearray_to_hex(hash_ecc),
            "hash_feat_xor_ecc": bytearray_to_hex(hash_feat_xor_ecc),
            "feat_xor_ecc": bytearray_to_hex(feat_xor_ecc),
        }

    @staticmethod
    def gen_proof(json_data):
        # img_path,
        # if json_data["msg"][0:2] != "0x":
        #     msg = hex(int(json_data["msg"]))
        #     json_data["msg"] = msg
        # new_feat = feat_bytearray_from_image_path(img_path)
        # print(bytearray_to_hex(new_feat))

        hash_ecc = hex_to_bytearray(json_data["hash_ecc"])
        feat_xor_ecc = hex_to_bytearray(json_data["feat_xor_ecc"])
        # msg = hex_to_bytearray(json_data["msg"])
        msg = "0x9a8f43"
        feat = json_data["feat"]
        print('feat', feat)
        code_error, hash_ecc_msg, recovered_hash_ecc = recover(feat, feat_xor_ecc, hash_ecc, msg)
        proof_succeed, proof_bin, session_id = generate_proof(feat, code_error, feat_xor_ecc, msg)

        return {
            "new_feat": bytearray_to_hex(feat),
            "recovered_hash_ecc": bytearray_to_hex(recovered_hash_ecc),
            "hash_ecc_msg": bytearray_to_hex(hash_ecc_msg),
            "code_error": bytearray_to_hex(code_error),
            "proof": bytearray_to_hex(proof_bin),
            "session_id": session_id,
            "proof_succeed": proof_succeed,
            "proof_bin": bytearray_to_hex(proof_bin),
        }

#
# # Usage:
# face_comparator = FaceComparison()
#
# img1_path = "./dataset/img1.jpg"
# img1_path_2 = "./dataset/img1.jpg"
# img2_path = "./dataset/img2.jpg"
#
# # Verify faces
# result = face_comparator.verify_faces(img1_path, img1_path_2)
# print(result)
#
# # Get face embeddings
# embedding_img1 = face_comparator.represent_face(img1_path)
# embedding_img2 = face_comparator.represent_face(img1_path_2)
#
# print(embedding_img1)
# print(embedding_img2)
#
# # Calculate distance and cosine similarity between embeddings
# dist = face_comparator.calculate_distance(embedding_img1, embedding_img2)
# cos_sim = face_comparator.calculate_cosine_similarity(embedding_img1, embedding_img2)
#
# print(dist)
# print(cos_sim)
