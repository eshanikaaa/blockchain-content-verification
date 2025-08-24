# blockchain.py
import hashlib
import time

class Block:
    def __init__(self, index, timestamp, content_hash, previous_hash):
        self.index = index
        self.timestamp = timestamp
        self.content_hash = content_hash
        self.previous_hash = previous_hash
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = f"{self.index}{self.timestamp}{self.content_hash}{self.previous_hash}"
        return hashlib.sha256(block_string.encode()).hexdigest()

class Blockchain:
    def __init__(self):
        self.chain = [self.create_genesis_block()]

    def create_genesis_block(self):
        return Block(0, time.time(), "Genesis Block", "0")

    def get_last_block(self):
        return self.chain[-1]

    def add_block(self, content_hash):
        index = len(self.chain)
        timestamp = time.time()
        previous_hash = self.get_last_block().hash
        block = Block(index, timestamp, content_hash, previous_hash)
        self.chain.append(block)
        return block

    def get_chain_data(self):
        return [
            {
                "index": block.index,
                "timestamp": block.timestamp,
                "content_hash": block.content_hash,
                "previous_hash": block.previous_hash,
                "hash": block.hash
            }
            for block in self.chain
        ]
