import { BaseAgent } from '../orchestrator/BaseAgent.ts'
import { chat } from '../../lib/ai/client.ts'
import type { AgentContext, PRResult } from '../../types/index.ts'

export class PullRequestAgent extends BaseAgent {
  name = 'pull_request'
  stepOrder = 7

  async execute(context: AgentContext): Promise<Partial<AgentContext>> {
    // Generate PR description
    const { content: prBody } = await chat([
      {
        role: 'system',
        content: `You are a technical writer generating a professional pull request description.
Use Markdown. Include: ## Summary, ## Root Cause, ## Changes Made, ## Testing, ## Notes.
End with: Closes #ISSUE_NUMBER.`,
      },
      {
        role: 'user',
        content: `Issue: ${JSON.stringify(context.issue)}
Fix Plan: ${JSON.stringify(context.fix_plan)}
Patch: ${context.patch_diff?.slice(0, 2000)}`,
      },
    ])

    // TODO: Call GitHubClient to create branch, commit files, open PR
    const pr_result: PRResult = {
      pr_url: `https://github.com/${context.repo?.full_name}/pull/1`,
      pr_number: 1,
      branch_name: `ai-fix/issue-${context.issue_id}`,
    }

    return { pr_result }
  }
}
