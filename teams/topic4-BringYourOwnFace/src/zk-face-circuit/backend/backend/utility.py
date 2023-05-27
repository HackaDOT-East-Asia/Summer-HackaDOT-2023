import traceback

import bchlib
import os
import random
import string
import json

from bridge import poseidon_hash, evm_prove, evm_verify
from torch import err

from convert import bytearray_to_hex, hex_to_bytearray

# BCH 오브젝트를 생성합니다.
BCH_POLYNOMIAL = 8219
BCH_BITS = 64
bch = bchlib.BCH(BCH_POLYNOMIAL, BCH_BITS)
CODE_LEN = 256


def generate_filename(length):
    letters = string.ascii_lowercase
    filename = ''.join(random.choice(letters) for i in range(length))
    return filename


def bch_error_correction(packet):
    """
    BCH 코드에 의한 오류 수정

    Parameters
    ----------
    packet : bytearray
    256비트의 데이터를 BCH에 의해 인코딩 한 것. 256 비트보다 크다.
    """

    # de-packetize
    data, ecc = packet[:-bch.ecc_bytes], packet[-bch.ecc_bytes:]

    # correct
    bitflips = bch.decode_inplace(data, ecc)

    # packetize
    packet = data + ecc

    return packet


def bitflip(packet):
    byte_num = random.randint(0, len(packet) - 1)
    bit_num = random.randint(0, 7)
    packet[byte_num] ^= (1 << bit_num)


def test_bch():
    data = bytearray(os.urandom(32))

    ecc = bch.encode(data)
    packet = data + ecc
    print(type(packet))

    assert packet == bch_error_correction(packet)


def xor(a, b):
    """
    배타적 논리합을 취합니다.

    Parameters
    ----------
    a : bytearray
    b : bytearray
    """
    # if a is str then change to bytearray
    if isinstance(a, str):
        # remove 0x
        if a[:2] == "0x":
            a = a[2:]
            a = bytearray.fromhex(a)
            result = bytearray([x ^ y for x, y in zip(a, b)])
            return result
        a = bytearray.fromhex(a)
        result = bytearray([x ^ y for x, y in zip(a, b)])
        return result
    print("a ", a, type(a))
    print("b ", b, type(b))
    result = bytearray([x ^ y for x, y in zip(a, b)])
    return result


def my_hash(data):
    """
    Poseidon 해시 함수를 취합니다.

    Parameters
    ----------
    data : bytearray
    """
    return hex_to_bytearray(poseidon_hash(bytearray_to_hex(data)))


def padding(data, n):
    """
    256비트가 되도록 0을 추가합니다.

    Parameters
    ----------
    data : bytearray
    n : バイト数
    """
    print("len of data is ", len(data))
    print("data ", data)
    n = 128
    padding_data = data.ljust(n, b'\x00')
    print('after padding ', padding_data)
    print('after padding len is ', len(padding_data))
    return padding_data


def fuzzy_commitment(feat_vec):
    """
    특징 벡터에서 h(w)와 c를 생성합니다.

    Parameters
    ----------
    feat_vec : bytearray
    """

    # 랜덤 벡터를 만든다.
    s = bytearray(os.urandom(32))

    ecc = bch.encode(s)
    packet = s + ecc
    print("packet is ", bytearray_to_hex(packet))
    print("len of packet is ", len(packet))

    feat_vec = padding(feat_vec, len(packet))

    c = xor(feat_vec, packet)

    h_w = my_hash(packet)

    return c, h_w


# def recover(feat_vec, c, h_w, m):
#     """
#     특징 벡터에서 w를 복원하고 e와 hash(m,w)를 반환합니다.
#
#     feat_vec : bytearray
#     c : bytearray
#     h_w : bytearray
#     m : bytearray
#     """
#     print("len of c is ", len(c))
#     print("len of feat_vec is ", len(feat_vec))
#     print("len of h_w is ", len(h_w))
#     print("len of m is ", len(m))
#     # assert (len(c) >= len(feat_vec))
#     if len(c) < len(feat_vec):
#         c = padding(c, len(feat_vec))
#     elif len(c) > len(feat_vec):
#         feat_vec = padding(feat_vec, len(c))
#     # c is 136 and feat_vec is 658
#     # c should be padding
#
#     l = len(c)
#     feat_vec = padding(feat_vec, l)
#     w1 = xor(feat_vec, c)
#     w = bch_error_correction(w1)
#
#     e = xor(w, w1)
#
#     h_m_w = my_hash(m + w)
#
#     recovered_h_W = my_hash(w)
#     print(recovered_h_W)
#
#     return e, h_m_w, recovered_h_W

def recover(feat_vec, c, h_w, m):
    """
    Recovers w from the feature vector and returns e and hash(m, w).

    feat_vec : bytearray
    c : bytearray
    h_w : bytearray
    m : bytearray
    """
    print("len of c is ", len(c))
    print("len of feat_vec is ", len(feat_vec))
    print("len of h_w is ", len(h_w))
    print("len of m is ", len(m))

    # Determine maximum length of c and feat_vec
    max_len = max(len(c), len(feat_vec))
    print("max_len is ", max_len)

    # Padding c and feat_vec to the same length
    c = padding(c, max_len)
    print("padded c is ", c)
    # feat_vec = padding(feat_vec, max_len)
    # print("padded feat_vec is ", feat_vec)

    w1 = xor(feat_vec, c)
    print("w1 is ", w1)
    w = bch_error_correction(w1)
    print("w is ", w)

    e = xor(w, w1)

    # Convert m to bytearray if it is not
    if isinstance(m, str):
        m = bytearray(m, 'utf-8')

    h_m_w = my_hash(m + w)

    recovered_h_W = my_hash(w)
    print(recovered_h_W)

    return e, h_m_w, recovered_h_W


def generate_proof(feat_vec, err, feat_xor_ecc, message):
    print('generating proof')
    session_id = generate_filename(20)
    session_dir = os.path.join("./storage", session_id)
    print(session_dir)
    # params_dir = "../build/params"
    # pk_dir = "../build/pk"

    if not os.path.exists('./storage'):
        os.mkdir('./storage')

    os.mkdir(session_dir)
    input_path = os.path.join(session_dir, "input.json")
    print("input path is ", input_path)
    features = bytearray_to_hex((feat_vec, CODE_LEN))
    errors = bytearray_to_hex((err, CODE_LEN))
    print("--------------------------------")
    commitment = bytearray_to_hex(padding(feat_xor_ecc, CODE_LEN))
    print("commitment is ", commitment)
    message = bytearray_to_hex(message)
    input_data = {
        "features": features,
        "errors": errors,
        "commitment": commitment,
        "message": message
    }
    input_json = json.dumps(input_data)
    print("input json is ", input_json)
    with open(input_path, "w") as f:
        f.write(input_json)

    # session_dir = "."

    # public input을 assert하면서 실패하면 False를 반환합니다.
    proof_path = os.path.join(session_dir, "proof.hex")
    print('proof path is ', proof_path)
    public_input_path = os.path.join(session_dir, "public.json")
    try:
        evm_prove(
            params_dir="./circuit/params",
            app_circuit_config="./circuit/configs/test1_circuit.config",
            agg_circuit_config="./circuit/configs/agg_circuit.config",
            pk_dir="./circuit/contracts/pks",
            input_path=input_path,
            proof_path=proof_path,
            public_input_path=public_input_path
        )
    except err:
        print("evm_prove failed", err)
        return False, b'', session_id

    # hex로 된 proof를 반환합니다.
    with open(proof_path, 'r') as f:
        # hex
        proof_bin = hex_to_bytearray(f.read())
        return True, proof_bin, session_id
    # shutil.rmtree(session_dir)


def verify_proof(proof, commitment, message):
    print('verifying proof')

    try:
        evm_verify(
            params_dir="./circuit/params",
            app_circuit_config="./circuit/configs/test1_circuit.config",
            agg_circuit_config="./circuit/configs/agg_circuit.config",
            vk_path="./circuit/contracts/app.vk",
            # change the belows
            public_input_path="./circuit/contracts/public.json",
            proof_path="./circuit/contracts/proof.hex",
        )
    except:
        print("evm_verify failed")
        return False
    return True


# 256비트 길이의 특징 벡터를 생성합니다.
# vec = np.random.randint(0, 2, 256)
# print(vec)
# bin_vec = bytearray(np.packbits(vec))
# print("bin_vec is ",bytearray_to_hex(bin_vec))
# bin_vec = padding(bin_vec, 64)
# print("padding bin_vec is ",bin_vec)
# h_w, c = fuzzy_commitment(bin_vec)
# print ("h_w is ",h_w), print("c is ",c)


def main():
    generate_proof(
        hex_to_bytearray(
            "0xddeb3779c4515c05a06495c3ec2403655d9b784d7502a064ebf3c093474b23ce"),
        hex_to_bytearray(
            "0x00000004410000000010a16008004002028000300200000100025001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"),
        hex_to_bytearray(
            "0x7d7fbf998b8e8d29756bcea0755e51a2e7208e3d9df90aa741450ced38cddbfcc8a96ccce1daa8bff47472d07907a612a761b2a1ec37d25407a6952020e413ee12f40ca7d81cb0dcab51591c3495c4b63134518969ec7c69b6469f0ab20e3d82ceffe4eda9ed71550f0ac020061eb7907cfd6eb54849fa5c7fc882764d7f815c08f5fee653a47402"),
        hex_to_bytearray("0x9a8f43")
    )


if __name__ == '__main__':
    main()
