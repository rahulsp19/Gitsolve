import type { AgentContext } from '../../types/index.ts'
import { IssueUnderstandingAgent } from '../issue-understanding/index.ts'
import { RepoExplorationAgent } from '../repo-exploration/index.ts'
import { CodeUnderstandingAgent } from '../code-understanding/index.ts'
import { SolutionPlanningAgent } from '../solution-planning/index.ts'
import { CodeGenerationAgent } from '../code-generation/index.ts'
import { ValidationAgent } from '../validation/index.ts'
import { PullRequestAgent } from '../pull-request/index.ts'
import { LearningAgent } from '../learning/index.ts'

export class AgentOrchestrator {
  private agents = [
    new IssueUnderstandingAgent(),
    new RepoExplorationAgent(),
    new CodeUnderstandingAgent(),
    new SolutionPlanningAgent(),
    new CodeGenerationAgent(),
    new ValidationAgent(),
    new PullRequestAgent(),
    new LearningAgent(),
  ]

  async run(context: AgentContext): Promise<AgentContext> {
    let ctx = { ...context }

    for (const agent of this.agents) {
      console.log(`[Orchestrator] Running agent: ${agent.name}`)
      try {
        ctx = await agent.run(ctx)
        if (agent.name === 'validation' && !ctx.validation_result?.passed) {
          console.warn('[Orchestrator] Validation failed — skipping PR creation')
          break
        }
      } catch (err) {
        console.error(`[Orchestrator] Agent ${agent.name} failed:`, err)
        throw err
      }
    }

    return ctx
  }
}
