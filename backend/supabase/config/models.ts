export const MODELS = {
  /** Primary reasoning via Groq: complex planning and code generation */
  PRIMARY: 'llama3-70b-8192',
  /** Fast classification via Groq: issue type, severity */
  FAST: 'mixtral-8x7b-32768',
  /** Code-specialized via OpenRouter: code generation tasks */
  CODE: 'deepseek/deepseek-coder-33b-instruct',
  /** Embeddings via Jina AI: code-optimized embeddings */
  EMBEDDING: 'jina-embeddings-v2-base-code',
  EMBEDDING_DIMS: 768,
} as const

export const AGENT_CONFIG = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 120_000,
  MIN_CONFIDENCE: 0.65,
  MAX_FILES_TO_INDEX: 500,
  MAX_CHUNKS_PER_FILE: 50,
  TOP_K_SEARCH: 20,
  RERANK_TOP_K: 8,
} as const
