# API Reference

***

## Table of Contents

* [API Reference](#api-reference)
  * [Table of Contents](#table-of-contents)
  * [Overview](#overview)
  * [Authentication](#authentication)
    * [Obtaining an API Key](#obtaining-an-api-key)
    * [Using the API Key](#using-the-api-key)
  * [Endpoints](#endpoints)
    * [1. `/v1/chat/completions`](#1-v1chatcompletions)
    * [2. `/v1/embeddings`](#2-v1embeddings)
    * [3. `/v1/vector/query`](#3-v1vectorquery)
  * [Data Schemas](#data-schemas)
    * [1. `CompletionRequest`](#1-completionrequest)
    * [2. `CompletionResponse`](#2-completionresponse)
    * [3. `EmbeddingRequest`](#3-embeddingrequest)
    * [4. `EmbeddingResponse`](#4-embeddingresponse)
    * [5. `VectorDocument`](#5-vectordocument)
    * [6. `QueryResult`](#6-queryresult)
  * [Error Codes & Handling](#error-codes--handling)
  * [Examples](#examples)
    * [1. Text Chat Completion (cURL)](#1-text-chat-completion-curl)
    * [2. Embedding Generation (JavaScript)](#2-embedding-generation-javascript)
    * [3. Vector Query (Python)](#3-vector-query-python)
  * [Versioning and Deprecation Policy](#versioning-and-deprecation-policy)

***

## Overview

The nootropic API provides programmatic access to core AI‐driven functionality, including chat/completion, embeddings generation, and vector store queries. All endpoints are prefixed with `/v1/` and accept JSON payloads. Responses are also returned in JSON. This reference describes each endpoint's purpose, request and response schemas, error handling, and usage examples.

***

## Authentication

All API calls require an API key. By default, the key is stored in a local configuration file (`~/.nootropic/config.json`) under the `apiKey` field. To override or specify a custom path, use the `NOOTROPIC_CONFIG` environment variable or include a `--config <path>` flag in CLI commands.

### Obtaining an API Key

1. Run `npx nootropic wizard` and follow prompts to generate or retrieve a local API key.
2. For cloud usage (e.g., hosted inference), sign up on the nootropic portal, navigate to "API Keys," and copy the key.
3. Store the key in `~/.nootropic/config.json`:

```jsonc
{
  "apiKey": "YOUR_API_KEY_HERE",
}
```

### Using the API Key

Include the API key in all HTTP requests either as a header or query parameter:

* **Header:**

  ```http
  Authorization: Bearer <API_KEY>
  ```

* **Query Parameter** (not recommended for production):

  ```http
  GET /v1/chat/completions?api_key=<API_KEY>
  ```

***

## Endpoints

### 1. `/v1/chat/completions`

Generate chat‐style completions (similar to ChatGPT) or instruct the model to perform specific tasks (e.g., code generation). Supports streaming and non‐streaming modes.

**Request**

* Method: `POST`
* URL: `/v1/chat/completions`
* Headers:
  * `Content-Type: application/json`
  * `Authorization: Bearer <API_KEY>`

**Body Schema (`CompletionRequest`)**

```jsonc
{
  "model": "string",                 // Required. Model identifier, e.g., "starcoder2-3b-4bit" or "openai:gpt-4o"
  "messages": [                       // Required. Array of message objects
    {
      "role": "system" | "user" | "assistant",
      "content": "string"
    }
  ],
  "temperature": 0.0,                 // Optional. Sampling temperature (0.0–1.0). Default: 0.2
  "top_p": 1.0,                       // Optional. Nucleus sampling parameter (0.0–1.0). Default: 1.0
  "max_tokens": 1024,                 // Optional. Maximum tokens in response. Default: 512
  "stream": false,                    // Optional. If true, enables streaming responses. Default: false
  "stop": ["string"],                 // Optional. One or more stop sequences
  "presence_penalty": 0.0,            // Optional. Encourages new topics. Range: –2.0 to 2.0. Default: 0.0
  "frequency_penalty": 0.0,           // Optional. Penalizes repeated phrases. Range: –2.0 to 2.0. Default: 0.0
  "user": "string"                    // Optional. Identifier for end‐user (for analytics)
}
```

**Response**

* Status Codes:
  * `200 OK`: Request succeeded
  * `400 Bad Request`: Missing or invalid parameters
  * `401 Unauthorized`: Invalid or missing API key
  * `429 Too Many Requests`: Rate limit exceeded
  * `500 Internal Server Error`: Model or server error

**Non‐Streaming Response Schema (`CompletionResponse`)**

```jsonc
{
  "id": "string",                    // Unique ID for this completion request
  "object": "chat.completion",       // Type of object returned
  "created": 1623855600,             // Unix timestamp (seconds) of creation
  "model": "string",                 // Model identifier used
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "string"          // Generated content
      },
      "finish_reason": "stop" | "length" | "token_limit"
    }
    // ...more choices if `n` > 1 specified
  ],
  "usage": {
    "prompt_tokens": 32,             // Number of tokens in the prompt
    "completion_tokens": 48,         // Number of tokens generated
    "total_tokens": 80               // Sum of prompt + completion tokens
  }
}
```

**Streaming Response**

If `"stream": true` in the request, the server returns a `text/event-stream` response. Each line prefixed with `data:` contains a JSON chunk:

```
data: {"id":"...","object":"chat.completion.chunk","created":...,"model":"...","choices":[{"delta":{"content":"Hello"},"index":0,"finish_reason":null}]}
data: {"id":"...","object":"chat.completion.chunk","created":...,"model":"...","choices":[{"delta":{"content":" world"},"index":0,"finish_reason":"stop"}]}
```

A final `data: [DONE]` line indicates completion.

***

### 2. `/v1/embeddings`

Generate embeddings for one or more input texts. Embeddings can be used for vector search or similarity tasks.

**Request**

* Method: `POST`
* URL: `/v1/embeddings`
* Headers:
  * `Content-Type: application/json`
  * `Authorization: Bearer <API_KEY>`

**Body Schema (`EmbeddingRequest`)**

```jsonc
{
  "model": "string",                  // Required. Embedding model identifier, e.g., "openai-embeddings-001" or "local-gpt-embed"
  "input": "string" | ["string"],     // Required. Single string or array of strings to embed
  "user": "string"                    // Optional. End‐user identifier
}
```

**Response**

* Status Codes:
  * `200 OK`
  * `400 Bad Request`
  * `401 Unauthorized`
  * `429 Too Many Requests`
  * `500 Internal Server Error`

**Embedding Response Schema (`EmbeddingResponse`)**

```jsonc
{
  "object": "list",                   // Always "list"
  "data": [
    {
      "index": 0,                     // Index of this input in the request
      "object": "embedding",          // Type of object returned
      "embedding": [0.012, -0.045, ... ]  // Array of floats (length varies by model)
    }
    // ...more items if `input` was an array
  ],
  "model": "string",                  // Model identifier used
  "usage": {
    "prompt_tokens": 8,               // Tokens consumed by input
    "total_tokens": 8                 // Same as prompt_tokens (no completion)
  }
}
```

***

### 3. `/v1/vector/query`

Query the vector store (Chroma by default) to find nearest neighbors for a given embedding or raw text (which is embedded internally).

**Request**

* Method: `POST`
* URL: `/v1/vector/query`
* Headers:
  * `Content-Type: application/json`
  * `Authorization: Bearer <API_KEY>`

**Body Schema (`VectorQueryRequest`)**

```jsonc
{
  "namespace": "string",             // Optional. Logical namespace in the vector store (default: "default")
  "top_k": 10,                        // Optional. Number of nearest neighbors to return (default: 10)
  "query_embedding": [0.01, 0.02, ... ],  // Either provide this or omit to use `query_text`
  "query_text": "string",             // If provided, the server computes embedding before querying
  "filters": {                        // Optional. Metadata filters (e.g., {"projectID": "projA"})
    "projectID": "string",
    "tags": ["string"]
  },
  "include_values": false,            // Optional. If true, return stored vectors in response (default: false)
  "include_metadata": true            // Optional. If true, include metadata in results (default: true)
}
```

> **Note:** Either `query_embedding` or `query_text` must be provided; if both are present, `query_embedding` takes precedence.

**Response**

* Status Codes:
  * `200 OK`
  * `400 Bad Request`
  * `401 Unauthorized`
  * `429 Too Many Requests`
  * `500 Internal Server Error`

**Query Response Schema (`QueryResult`)**

```jsonc
{
  "namespace": "string",             // Namespace used for the query
  "model": "string",                 // Embedding model used if `query_text` was given
  "created": 1623855600,             // Unix timestamp
  "results": [
    {
      "id": "string",                // ID of the matching vector/document
      "score": 0.87,                 // Similarity score (e.g., cosine similarity)
      "values"?: [0.01, -0.02, ...], // Optional. Stored vector (if `include_values: true`)
      "metadata"?: {                 // Optional. Associated metadata (if `include_metadata: true`)
        "projectID": "string",
        "tags": ["string"],
        "timestamp": "ISO-8601"
      }
    }
    // ... up to `top_k` items
  ]
}
```

***

## Data Schemas

Below are shared schema definitions used by multiple endpoints.

### 1. `CompletionRequest`

```jsonc
{
  "model": "string",
  "messages": [
    {
      "role": "system" | "user" | "assistant",
      "content": "string"
    }
  ],
  "temperature"?: 0.0,
  "top_p"?: 1.0,
  "max_tokens"?: 1024,
  "stream"?: false,
  "stop"?: ["string"],
  "presence_penalty"?: 0.0,
  "frequency_penalty"?: 0.0,
  "user"?: "string"
}
```

### 2. `CompletionResponse`

```jsonc
{
  "id": "string",
  "object": "chat.completion",
  "created": 1623855600,
  "model": "string",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "string"
      },
      "finish_reason": "stop" | "length" | "token_limit"
    }
  ],
  "usage": {
    "prompt_tokens": 32,
    "completion_tokens": 48,
    "total_tokens": 80
  }
}
```

### 3. `EmbeddingRequest`

```jsonc
{
  "model": "string",
  "input": "string" | ["string"],
  "user"?: "string"
}
```

### 4. `EmbeddingResponse`

```jsonc
{
  "object": "list",
  "data": [
    {
      "index": 0,
      "object": "embedding",
      "embedding": [0.012, -0.045, ... ]
    }
  ],
  "model": "string",
  "usage": {
    "prompt_tokens": 8,
    "total_tokens": 8
  }
}
```

### 5. `VectorDocument`

Represents a stored vector and its metadata in the vector database.

```jsonc
{
  "id": "string",
  "values": [0.01, 0.02, ... ],   // Float array of embedding values
  "metadata": {
    "projectID": "string",
    "tags": ["string"],
    "timestamp": "ISO-8601"
  }
}
```

### 6. `QueryResult`

```jsonc
{
  "namespace": "string",
  "model": "string",
  "created": 1623855600,
  "results": [
    {
      "id": "string",
      "score": 0.87,
      "values"?: [0.01, -0.02, ... ],
      "metadata"?: {
        "projectID": "string",
        "tags": ["string"],
        "timestamp": "ISO-8601"
      }
    }
  ]
}
```

***

## Error Codes & Handling

All endpoints return standard HTTP status codes. The response body for error cases follows this schema:

```jsonc
{
  "error": {
    "code": "string",           // e.g., "invalid_request", "unauthorized", "rate_limit_exceeded"
    "message": "string",        // Human-readable explanation
    "details"?: [               // Optional. Array of validation errors or sub-errors
      {
        "field": "string",      // Name of the invalid parameter or field
        "issue": "string"       // Description of the issue
      }
    ]
  }
}
```

**Common Error Codes**

* `400 Bad Request`
  * `invalid_request`: Missing required field or invalid parameter type.
  * `model_not_found`: Specified model ID is not recognized or supported.
  * `invalid_stop_sequence`: Provided stop sequence conflicts with content.
* `401 Unauthorized`
  * `api_key_missing`: No Authorization header or api\_key provided.
  * `api_key_invalid`: Provided API key is invalid or expired.
* `403 Forbidden`
  * `model_access_denied`: API key does not have permission to access the requested model.
* `404 Not Found`
  * `resource_not_found`: For example, querying a vector namespace that doesn't exist.
* `429 Too Many Requests`
  * `rate_limit_exceeded`: Exceeded maximum requests per minute. Retry after the `Retry-After` header value (in seconds).
* `500 Internal Server Error`
  * `model_error`: Underlying model crashed or returned an unexpected response.
  * `vector_store_error`: Unable to query or write to the vector database.

***

## Examples

### 1. Text Chat Completion (cURL)

```bash
curl -X POST https://api.nootropic.ai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "starcoder2-3b-4bit",
    "messages": [
      { "role": "system", "content": "You are a helpful programming assistant." },
      { "role": "user", "content": "Generate a function to reverse a linked list in JavaScript." }
    ],
    "temperature": 0.2,
    "max_tokens": 256
  }'
```

**Response (abridged)**

````jsonc
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1623855600,
  "model": "starcoder2-3b-4bit",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "```javascript\nfunction reverseLinkedList(head) {\n  let prev = null;\n  let current = head;\n  while (current) {\n    const nextNode = current.next;\n    current.next = prev;\n    prev = current;\n    current = nextNode;\n  }\n  return prev;\n}\n```",
      },
      "finish_reason": "stop",
    },
  ],
  "usage": {
    "prompt_tokens": 27,
    "completion_tokens": 48,
    "total_tokens": 75,
  },
}
````

***

### 2. Embedding Generation (JavaScript)

```js
import fetch from "node-fetch";

async function generateEmbeddings(textArray) {
  const response = await fetch("https://api.nootropic.ai/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NOOTROPIC_API_KEY}`,
    },
    body: JSON.stringify({
      model: "openai-embeddings-001",
      input: textArray,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Embedding error: ${error.error.message}`);
  }

  const data = await response.json();
  return data.data.map((item) => ({
    index: item.index,
    embedding: item.embedding,
  }));
}

// Usage
generateEmbeddings(["Hello, world!", "AI is awesome!"])
  .then(console.log)
  .catch(console.error);
```

***

### 3. Vector Query (Python)

```python
import requests
import os

API_URL = 'https://api.nootropic.ai/v1/vector/query'
API_KEY = os.getenv('NOOTROPIC_API_KEY')

def query_vector_store(query_text):
    # First, embed the query text
    embed_resp = requests.post(
        'https://api.nootropic.ai/v1/embeddings',
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'model': 'openai-embeddings-001',
            'input': query_text
        }
    )
    embed_resp.raise_for_status()
    embedding = embed_resp.json()['data'][0]['embedding']

    # Now perform the vector query
    query_resp = requests.post(
        API_URL,
        headers={
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        },
        json={
            'namespace': 'default',
            'top_k': 5,
            'query_embedding': embedding,
            'include_metadata': True
        }
    )
    query_resp.raise_for_status()
    return query_resp.json()['results']

# Usage

results = query_vector_store('How to connect to Redis in Node.js?')
for idx, item in enumerate(results):
    print(f"Rank {idx+1}: ID={item['id']}, Score={item['score']}")
    print(f"Metadata: {item.get('metadata')}\n")
```

***

## Versioning and Deprecation Policy

* **Semantic Versioning:** All API changes follow SemVer. The version in use is implicitly tied to the CLI version installed (e.g., `nootropic@1.2.3` corresponds to v1 of the REST API).
* **Deprecation Notice:** When an endpoint or field is scheduled for removal, a deprecation warning will appear in the response header:

```
Warning: 299 - "Deprecated API field 'stop' will be removed in v2.0"
```

\</rewritten\_file>
