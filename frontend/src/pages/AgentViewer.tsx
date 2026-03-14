import { useAgentStore } from '@/stores/agentStore'
import { useRealtimeRun } from '@/hooks/useRealtimeRun'

export default function AgentViewer() {
  const { activeRun, steps } = useAgentStore()
  useRealtimeRun(activeRun?.id ?? null)

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-white">AI Reasoning</h1>
      {/* Live agent pipeline visualization rendered here */}
      {steps.map((step) => (
        <div key={step.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="font-mono text-sm text-slate-300">{step.agent_name}</p>
          <p className="text-xs text-slate-500">{step.status}</p>
        </div>
      ))}
    </div>
  )
}
