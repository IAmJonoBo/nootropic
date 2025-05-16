#!/usr/bin/env python3
"""
embedding_service.py

Loads NV-Embed-v2 from HuggingFace and exposes a simple HTTP API for text-to-embedding.

Setup:
  pip install transformers torch flask
  git lfs install
  git clone https://huggingface.co/nvidia/NV-Embed-v2

Usage:
  python scripts/embedding_service.py
  # POST to http://localhost:5000/embed with JSON: {"texts": ["your text"]}

Quantization: (stub) Add GGUF/AutoGPTQ support for CPU/low-VRAM in future.
"""
from flask import Flask, request, jsonify
from transformers import AutoTokenizer, AutoModel
import torch
import os

MODEL_NAME = os.environ.get("EMBED_MODEL", "nvidia/NV-Embed-v2")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

app = Flask(__name__)
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME).to(DEVICE)

@app.route('/embed', methods=['POST'])
def embed():
    data = request.get_json()
    texts = data.get('texts', [])
    inputs = tokenizer(texts, padding=True, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        outputs = model(**inputs, output_hidden_states=True)
        embeddings = outputs.hidden_states[-1][:,0].cpu().numpy().tolist()
    return jsonify({"embeddings": embeddings})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000) 