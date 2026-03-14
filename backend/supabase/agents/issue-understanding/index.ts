import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import { chatJSON } from '../../lib/ai/client.ts'
import type { AgentContext, IssueAnalysis } from '../../types/index.ts'

export class IssueUnderstandingAgent extends BaseAgent {
  name = 'issue_understanding'
  stepOrder = 1

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    const { data, tokens } = await chatJSON<IssueAnalysis>([
      {
        role: 'system',
        content: `You are an expert software engineer analyzing a GitHub issue.
Extract structured information and return valid JSON only.
Fields: issue_type (bug|feature|docs|perf|security), severity (critical|high|medium|low),
affected_components (string[]), error_messages (string[]), reproduction_steps (string[]),
keywords (string[]), confidence (0-1).`,
      },
      {
        role: 'user',
        content: `Analyze this GitHub issue:
Title: ${context.issue_id}
Body: (fetched from GitHub)
Labels: []`,
      },
    ])

    return { issue: data }
  }
}
