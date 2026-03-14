export const MODELS = {
  /** Primary reasoning: complex planning and code generation */
  PRIMARY: 'gpt-4o',
  /** Long-context: large file comprehension */
  LONG_CONTEXT: 'claude-sonnet-4-5',
  /** Fast classification: issue type, severity */
  FAST: 'mixtral-8x7b-32768',
  /** Embeddings */
  EMBEDDING: 'text-embedding-3-large',
  EMBEDDING_DIMS: 3072,
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
