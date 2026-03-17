import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import type { AgentContext, FileIndex } from '../../types/index.ts'

const SUPPORTED_EXTENSIONS = ['.py', '.js', '.ts', '.java', '.go', '.c', '.cpp'];
const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'vendor']

export class RepoExplorationAgent extends BaseAgent {
  name = 'repo_exploration'
  stepOrder = 2

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    // Fetch repo tree via GitHub API, filter relevant files
    // Chunk and embed each file, store in code_embeddings table
    const indexed_files: FileIndex[] = [] // populated from GitHub + pgvector upsert

    return { indexed_files, repo: context.repo }
  }
}
