import os

from eth_account import Account
from hexbytes import HexBytes
from web3 import Web3
from web3.middleware import geth_poa_middleware

ALLTHATNODE_URL = 'https://polygon-testnet-rpc.allthatnode.com:8545'  # polygon mumbai
PRIVATE_KEY = os.environ['PRIVATE_KEY']
CONTRACT_ABI = {
    "constant": False,
    "inputs": [
        {"name": "router", "type": "address"},
        {"name": "amountIn", "type": "uint256"},
        {"name": "amountOutMin", "type": "uint256"},
        {"name": "tokenIn", "type": "address"},
        {"name": "tokenOut", "type": "address"},
        {"name": "poolFee", "type": "uint24"}
    ],
    "name": "exactInputSingle",
    "outputs": [
        {"name": "amountOut", "type": "uint256"}
    ],
    "payable": True,
    "stateMutability": "payable",
    "type": "function"
}
ENTRY_POINT_ADDRESS = '0xdbB65e09b3F89c69972B12613e1857d86E322a43'


def _connect_to_node(node_provider_url):
    w3 = Web3(Web3.HTTPProvider(node_provider_url))
    w3.middleware_onion.inject(geth_poa_middleware, layer=0)
    return w3


class EntryPointContract:
    def __init__(self, node_provider_url, private_key, contract_abi, contract_address):
        self.w3 = _connect_to_node(node_provider_url)
        self.account = self._load_account(private_key)
        self.contract = self._initialize_contract(contract_abi, contract_address)

    def _load_account(self, private_key):
        return Account.from_key(private_key)

    def _initialize_contract(self, contract_abi, contract_address):
        return self.w3.eth.contract(
            address=Web3.to_checksum_address(contract_address),
            abi=contract_abi
        )

    def handle_ops(self, ops, gas_limit):
        transaction = self.contract.functions.handleOps(ops).buildTransaction({
            'from': self.account.address,
            'gas': gas_limit,
            'gasPrice': self.w3.eth.gas_price,
            'nonce': self.w3.eth.get_transaction_count(self.account.address),
        })

        signed_txn = self.account.signTransaction(transaction)
        txn_hash = self.w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        txn_receipt = self.w3.eth.wait_for_transaction_receipt(txn_hash)
        return txn_receipt

    def create_account(self, callData, commitment, proof):
        user_op_create_account = {
            'sender': '0x0000000000000000000000000000000000000000',
            'callData': callData,
            'commitment': commitment,
            'proof': proof,
            'callGasLimit': 30_000_000,
        }

        txn_receipt = self.handle_ops([user_op_create_account], 30000000)
        print(txn_receipt)
        return txn_receipt
