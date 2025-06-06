# Tutorial: Configuring Local LLM Backends

## Overview

This tutorial covers how to configure and use local LLM backends in nootropic, including Tabby ML, Ollama, and llama.cpp for local model inference.

## Local Backends

### 1. Tabby ML Configuration

1. **Basic Setup**
   Create `tabby.config.json`:
   ```json
   {
     "port": 8000,
     "host": "127.0.0.1",
     "backends": [
       {
         "type": "ollama",
         "models": ["starcoder2-3b-4bit", "gemma3-1b-4bit"]
       }
     ]
   }
   ```

2. **Advanced Configuration**
   ```json
   {
     "port": 8000,
     "host": "127.0.0.1",
     "backends": [
       {
         "type": "ollama",
         "models": ["starcoder2-3b-4bit", "gemma3-1b-4bit"],
         "options": {
           "num_ctx": 4096,
           "num_gpu": 1
         }
       },
       {
         "type": "vllm",
         "models": ["llama2-7b-4bit"],
         "options": {
           "tensor_parallel_size": 2,
           "gpu_memory_utilization": 0.9
         }
       }
     ]
   }
   ```

### 2. Ollama Setup

1. **Installation**
   ```bash
   # macOS
   curl -fsSL https://ollama.com/install.sh | sh

   # Linux
   curl -fsSL https://ollama.com/install.sh | sh

   # Windows (WSL2)
   curl -fsSL https://ollama.com/install.sh | sh
   ```

2. **Model Management**
   ```bash
   # Pull models
   ollama pull starcoder2:3b
   ollama pull gemma:1b

   # List models
   ollama list

   # Remove models
   ollama rm starcoder2:3b
   ```

3. **Custom Models**
   Create `Modelfile`:
   ```dockerfile
   FROM starcoder2:3b
   PARAMETER temperature 0.7
   PARAMETER top_p 0.95
   SYSTEM """
   You are a helpful AI coding assistant.
   """
   ```

### 3. llama.cpp Setup

1. **Installation**
   ```bash
   git clone https://github.com/ggerganov/llama.cpp.git
   cd llama.cpp
   make
   ```

2. **Model Conversion**
   ```bash
   # Convert to GGUF format
   python3 convert.py --outfile model.gguf --outtype q4_0 model.bin
   ```

3. **Running Server**
   ```bash
   ./server -m model.gguf -c 4096 -ngl 1
   ```

## Local Model Selection

### 1. Hardware-Aware Selection

1. **CPU Configuration**
   ```json
   {
     "hardware": {
       "type": "cpu",
       "threads": 8,
       "memory": "16GB",
       "preferredModels": ["starcoder2-3b-4bit", "gemma3-1b-4bit"]
     }
   }
   ```

2. **GPU Configuration**
   ```json
   {
     "hardware": {
       "type": "gpu",
       "cuda": true,
       "memory": "8GB",
       "preferredModels": ["llama2-7b-4bit", "starcoder2-3b-4bit"]
     }
   }
   ```

### 2. Local Performance Tuning

1. **Model Parameters**
   ```json
   {
     "modelParams": {
       "temperature": 0.7,
       "top_p": 0.95,
       "max_tokens": 2048,
       "presence_penalty": 0.1,
       "frequency_penalty": 0.1
     }
   }
   ```

2. **Local Batch Processing**
   ```json
   {
     "batchProcessing": {
       "enabled": true,
       "maxBatchSize": 8,
       "timeout": 30000
     }
   }
   ```

## Local Monitoring and Optimization

### 1. Local Performance Metrics

1. **Latency Monitoring**
   ```typescript
   const metrics = {
     inferenceTime: 0,
     tokenCount: 0,
     memoryUsage: 0
   };
   ```

2. **Local Resource Usage**
   ```bash
   # Monitor GPU usage
   nvidia-smi

   # Monitor CPU usage
   top
   ```

### 2. Local Optimization Techniques

1. **Model Quantization**
   ```bash
   # Quantize model to 4-bit
   python3 quantize.py --model model.bin --bits 4
   ```

2. **Local Caching**
   ```json
   {
     "cache": {
       "enabled": true,
       "maxSize": "1GB",
       "ttl": 3600
     }
   }
   ```

## Local Troubleshooting

1. **Common Local Issues**
   - Out of memory: Reduce model size or batch size
   - Slow inference: Check hardware utilization
   - Model loading errors: Verify model files and paths

2. **Local Debugging**
   ```bash
   # Enable debug logging
   export TABBY_DEBUG=1
   tabby serve --config tabby.config.json
   ```

## What's Next

- [Tutorial: Implementing Local Custom Agents](tutorial_custom_agents.md)
- [Tutorial: Local Performance Optimization](tutorial_performance.md)
- [Tutorial: Local Security Best Practices](tutorial_security.md)

## Additional Resources

- [Local Architecture Documentation](../ARCHITECTURE.md)
- [Local API Reference](../API_REFERENCE.md)
- [Local Security Guidelines](../SECURITY.md) 