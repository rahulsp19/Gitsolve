import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import { chatJSON } from '../../lib/ai/client.ts'
import type { AgentContext, ValidationResult } from '../../types/index.ts'

export class ValidationAgent extends BaseAgent {
  name = 'validation'
  stepOrder = 6

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    // TODO: Run E2B sandbox for actual linting/type-checking
    // MVP: Use LLM to validate the diff
    const { data } = await chatJSON<ValidationResult>([
      {
        role: 'system',
        content: `You are a code reviewer validating a patch.
Check for: syntax errors, undefined references, logic errors, style violations.
Return JSON: passed (bool), issues_found (string[]), warnings (string[]), confidence_score (0-1).`,
      },
      {
        role: 'user',
        content: `Validate this patch:
\`\`\`diff
${context.patch_diff}
\`\`\`

Original context: ${JSON.stringify(context.fix_plan)}`,
      },
    ])

    return { validation_result: data }
  }
}
