# blockchain.py
import hashlib
import json
import time
import os
from typing import List, Dict, Any


CHAIN_FILE = "chain_data.json"


class Blockchain:
    def __init__(self, chain_file: str = CHAIN_FILE):
        self.chain_file = chain_file
        self.pending_data: List[Dict[str, Any]] = []  # data waiting to be included in the next block
        self.chain: List[Dict[str, Any]] = []
        if os.path.exists(self.chain_file):
            try:
                with open(self.chain_file, "r") as f:
                    data = json.load(f)
                    self.chain = data.get("chain", [])
                    self.pending_data = data.get("pending_data", [])
            except Exception:
                # if corrupted, start fresh
                self.create_genesis_block()
                self._persist_chain()
        else:
            self.create_genesis_block()
            self._persist_chain()

    def create_genesis_block(self):
        """Create the first block in the chain."""
        genesis_block = {
            "index": 1,
            "timestamp": time.time(),
            "proof": 1,
            "previous_hash": "0",
            "data": [],
        }
        self.chain = [genesis_block]

    def get_last_block(self) -> Dict[str, Any]:
        return self.chain[-1]

    def proof_of_work(self, previous_proof: int) -> int:
        """
        Simple Proof of Work:
        - Find a number new_proof such that hash(new_proof^2 - previous_proof^2) starts with '0000'
        """
        new_proof = 1
        check_proof = False
        while not check_proof:
            hash_operation = hashlib.sha256(str(new_proof**2 - previous_proof**2).encode()).hexdigest()
            if hash_operation[:4] == "0000":
                check_proof = True
            else:
                new_proof += 1
        return new_proof

    def hash_block(self, block: Dict[str, Any]) -> str:
        """Create a SHA-256 hash of a block (with sorted keys)."""
        block_str = json.dumps(block, sort_keys=True).encode()
        return hashlib.sha256(block_str).hexdigest()

    def is_chain_valid(self, chain: List[Dict[str, Any]] = None) -> bool:
        if chain is None:
            chain = self.chain

        previous_block = chain[0]
        block_index = 1

        while block_index < len(chain):
            block = chain[block_index]
            if block["previous_hash"] != self.hash_block(previous_block):
                return False

            previous_proof = previous_block["proof"]
            proof = block["proof"]
            hash_operation = hashlib.sha256(str(proof**2 - previous_proof**2).encode()).hexdigest()
            if hash_operation[:4] != "0000":
                return False

            previous_block = block
            block_index += 1

        return True

    def add_content(self, content: str, metadata: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Add content to pending queue. It does NOT create a block immediately.
        Returns the content object (with hash).
        """
        if metadata is None:
            metadata = {}
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        content_obj = {
            "content_hash": content_hash,
            "content_preview": content[:200],  # short preview
            "metadata": metadata,
            "timestamp": time.time(),
        }
        # prevent exact duplicate pending content
        if any(d["content_hash"] == content_hash for d in self.pending_data):
            return {"status": "duplicate_pending", "content_hash": content_hash}

        # prevent duplicate in chain
        if self._content_in_chain_hash(content_hash):
            return {"status": "already_in_chain", "content_hash": content_hash}

        self.pending_data.append(content_obj)
        self._persist_chain()
        return {"status": "added_to_pending", "content_hash": content_hash}

    def mine_block(self) -> Dict[str, Any]:
        """
        Mines a new block including all pending data.
        Returns the new block.
        """
        previous_block = self.get_last_block()
        previous_proof = previous_block["proof"]
        proof = self.proof_of_work(previous_proof)
        previous_hash = self.hash_block(previous_block)

        block = {
            "index": previous_block["index"] + 1,
            "timestamp": time.time(),
            "proof": proof,
            "previous_hash": previous_hash,
            "data": self.pending_data.copy(),  # include all pending data
        }

        # reset pending data
        self.pending_data = []
        self.chain.append(block)
        self._persist_chain()
        return block

    def verify_content(self, content: str = None, content_hash: str = None) -> Dict[str, Any]:
        """
        Verify if given content or content_hash exists on the chain.
        Returns dict with verified: bool and location details if found.
        """
        if content_hash is None:
            if content is None:
                raise ValueError("Either content or content_hash must be provided")
            content_hash = hashlib.sha256(content.encode()).hexdigest()

        for block in self.chain:
            for item in block.get("data", []):
                if item.get("content_hash") == content_hash:
                    return {
                        "verified": True,
                        "block_index": block["index"],
                        "timestamp": item.get("timestamp"),
                        "block_timestamp": block.get("timestamp"),
                        "content_preview": item.get("content_preview"),
                    }
        # maybe it's still pending
        for item in self.pending_data:
            if item.get("content_hash") == content_hash:
                return {
                    "verified": False,
                    "pending": True,
                    "content_preview": item.get("content_preview"),
                    "timestamp": item.get("timestamp"),
                }

        return {"verified": False, "pending": False}

    def _content_in_chain_hash(self, content_hash: str) -> bool:
        for block in self.chain:
            for item in block.get("data", []):
                if item.get("content_hash") == content_hash:
                    return True
        return False

    def _persist_chain(self):
        data = {"chain": self.chain, "pending_data": self.pending_data}
        with open(self.chain_file, "w") as f:
            json.dump(data, f, indent=2, sort_keys=True)

    def get_chain(self) -> Dict[str, Any]:
        return {"length": len(self.chain), "chain": self.chain, "pending": self.pending_data}

