import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import { chat } from '../../lib/ai/client.ts'
import type { AgentContext } from '../../types/index.ts'

export class CodeGenerationAgent extends BaseAgent {
  name = 'code_generation'
  stepOrder = 5

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    const fileContent = context.relevant_files?.[0]?.content ?? ''
    const filePath = context.relevant_files?.[0]?.file_path ?? ''

    const { content: patch_diff } = await chat([
      {
        role: 'system',
        content: `You are a senior software engineer generating a minimal, correct patch.
Preserve code style exactly. Return unified diff format ONLY — no explanations, no markdown.`,
      },
      {
        role: 'user',
        content: `Fix Plan: ${JSON.stringify(context.fix_plan)}

File: ${filePath}
\`\`\`
${fileContent}
\`\`\`

Rules:
1. Minimal diff — change only what is necessary
2. Preserve indentation and naming conventions
3. Add a brief inline comment explaining the fix
4. Output unified diff format only`,
      },
    ])

    return { patch_diff }
  }
}
