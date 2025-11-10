# app.py
from flask import Flask, request, jsonify
from blockchain import Blockchain

app = Flask(__name__)

blockchain = Blockchain()


@app.route('/', methods=['GET'])
def welcome():
    return jsonify({"message": "Blockchain backend is running"}), 200


@app.route('/chain', methods=['GET'])
def get_chain():
    return jsonify(blockchain.get_chain()), 200


@app.route('/add_content', methods=['POST'])
def add_content():
    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "Missing 'content' in request body"}), 400

    metadata = data.get("metadata", {})
    response = blockchain.add_content(data["content"], metadata)
    return jsonify(response), 201


@app.route('/mine', methods=['GET'])
def mine_block():
    block = blockchain.mine_block()
    return jsonify(block), 200


@app.route('/verify', methods=['POST'])
def verify_content():
    data = request.get_json()
    if not data or not ("content" in data or "content_hash" in data):
        return jsonify({"error": "Provide 'content' or 'content_hash'"}), 400

    content = data.get("content")
    content_hash = data.get("content_hash")
    result = blockchain.verify_content(content=content, content_hash=content_hash)
    return jsonify(result), 200


@app.route('/is_valid', methods=['GET'])
def is_valid():
    valid = blockchain.is_chain_valid()
    return jsonify({"valid": valid}), 200


if __name__ == "__main__":
    app.run()

