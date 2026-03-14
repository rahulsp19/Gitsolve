import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import { generateEmbedding } from '../../lib/embeddings/generator.ts'
import type { AgentContext, RankedFile } from '../../types/index.ts'

export class CodeUnderstandingAgent extends BaseAgent {
  name = 'code_understanding'
  stepOrder = 3

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    const issueText = context.issue?.keywords.join(' ') ?? ''
    const queryEmbedding = await generateEmbedding(issueText)
    // Run pgvector similarity search, rerank with Cohere
    const relevant_files: RankedFile[] = [] // populated from Supabase vector search

    return { relevant_files }
  }
}
