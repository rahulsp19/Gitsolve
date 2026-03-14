import { getOpenAI } from '../ai/client.ts'
import { MODELS } from '../../config/models.ts'

/** Generate embeddings for an array of text strings */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = getOpenAI()
  const response = await openai.embeddings.create({
    model: MODELS.EMBEDDING,
    input: texts,
    dimensions: MODELS.EMBEDDING_DIMS,
  })
  return response.data.map((d) => d.embedding)
}

/** Generate a single embedding */
export async function generateEmbedding(text: string): Promise<number[]> {
  const [embedding] = await generateEmbeddings([text])
  return embedding
}
