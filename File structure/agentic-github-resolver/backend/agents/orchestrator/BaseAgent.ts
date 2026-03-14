import type { AgentContext, AgentStep } from '../../types/index.ts'

export abstract class BaseAgent {
  abstract name: string
  abstract stepOrder: number

  abstract execute(context: AgentContext): Promise<Partial<AgentContext>>

  async run(context: AgentContext): Promise<AgentContext> {
    const step: AgentStep = {
      run_id: context.run_id,
      agent_name: this.name,
      status: 'running',
      step_order: this.stepOrder,
      started_at: new Date().toISOString(),
    }

    const startTime = Date.now()
    const updates = await this.execute(context)

    step.status = 'success'
    step.duration_ms = Date.now() - startTime
    step.completed_at = new Date().toISOString()
    step.output = updates as Record<string, unknown>

    return {
      ...context,
      ...updates,
      step_logs: [...context.step_logs, step],
    }
  }
}
