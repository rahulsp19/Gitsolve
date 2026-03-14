import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import { chatJSON } from '../../lib/ai/client.ts'
import type { AgentContext, FixPlan } from '../../types/index.ts'

export class SolutionPlanningAgent extends BaseAgent {
  name = 'solution_planning'
  stepOrder = 4

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    const codeContext = (context.relevant_files ?? [])
      .slice(0, 5)
      .map((f) => `### ${f.file_path}\n\`\`\`\n${f.content}\n\`\`\``)
      .join('\n\n')

    const { data } = await chatJSON<FixPlan>([
      {
        role: 'system',
        content: `You are a senior software engineer creating a fix strategy.
Return JSON with: strategy (string), affected_files (string[]), change_description (string),
confidence (0-1), alternatives (string[]).`,
      },
      {
        role: 'user',
        content: `Issue Analysis: ${JSON.stringify(context.issue)}

Relevant Code:
${codeContext}

Design the optimal fix strategy.`,
      },
    ])

    return { fix_plan: data }
  }
}
