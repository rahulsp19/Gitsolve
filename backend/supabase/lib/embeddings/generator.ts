import { MODELS } from '../../config/models.ts'

/**
 * Generate embeddings using Jina AI API.
 * Model: jina-embeddings-v2-base-code (optimized for source code)
 */

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings'

interface JinaEmbeddingResponse {
  data: { embedding: number[] }[]
  usage: { total_tokens: number }
}

/** Generate embeddings for an array of text strings */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const apiKey = Deno.env.get('JINA_API_KEY')
  if (!apiKey) throw new Error('JINA_API_KEY is not set')

  const response = await fetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODELS.EMBEDDING,
      input: texts,
    }),
  })

  if (!response.ok) {
    throw new Error(`Jina API error ${response.status}: ${await response.text()}`)
  }

  const data: JinaEmbeddingResponse = await response.json()
  return data.data.map((d) => d.embedding)
}

/** Generate a single embedding */
export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text])
  return embedding
}
