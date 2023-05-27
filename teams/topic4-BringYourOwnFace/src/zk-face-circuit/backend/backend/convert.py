import numpy as np
from deepface import DeepFace


# def bytearray_to_hex(ba):
#     print('ba: ', ba, type(ba))
#     # Extract the string part from the tuple
#     if isinstance(ba, tuple) and isinstance(ba[0], str):
#         ba = bytearray.fromhex(ba[0][2:])  # exclude the
#         print("isInstance tuple", ba, type(ba))
#     elif isinstance(ba, str):
#         ba = bytearray.fromhex(ba)
#         print("isInstance str", ba, type(ba))
#     return '0x' + ''.join(format(x, '02x') for x in ba)

def bytearray_to_hex(ba):
    print('ba: ', ba, type(ba))
    # Extract the bytearray part from the tuple
    if isinstance(ba, tuple) and isinstance(ba[0], bytearray):
        ba = ba[0]  # Get the bytearray from the tuple
    elif isinstance(ba, tuple) and isinstance(ba[0], str):
        ba = bytearray.fromhex(ba[0][2:])  # Exclude the '0x'
    elif isinstance(ba, str):
        ba = bytearray.fromhex(ba[2:])  # Exclude the '0x'

    print("final ba: ", ba, type(ba))
    return '0x' + ''.join(format(x, '02x') for x in ba)




def hex_to_bytearray(hex_string):
    print('hex_string: ', hex_string)
    return bytearray.fromhex(hex_string[2:])


def feat_bytearray_from_image_path(img_path):
    # Get the embeddings for the image
    embedding = DeepFace.represent(img_path)

    # Ensure embedding is an array of integers (DeepFace.represent returns a list of floats)
    int_embedding = [int(e * 1000) for e in embedding]

    # Convert to a byte array
    feat_bytearray = bytearray(np.packbits(int_embedding))

    return feat_bytearray
