import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAgentStore } from '@/stores/agentStore'
import type { AgentStep, AgentRun } from '@/types'

/** Subscribe to live agent step updates for a given run */
export function useRealtimeRun(runId: string | null) {
  const { updateStep, setActiveRun } = useAgentStore()

  useEffect(() => {
    if (!runId) return

    const stepsChannel = supabase
      .channel(`run-steps-${runId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agent_steps',
          filter: `run_id=eq.${runId}`,
        },
        (payload) => {
          if (payload.new) {
            updateStep((payload.new as AgentStep).id, payload.new as AgentStep)
          }
        }
      )
      .subscribe()

    const runChannel = supabase
      .channel(`run-status-${runId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'agent_runs',
          filter: `id=eq.${runId}`,
        },
        (payload) => {
          if (payload.new) setActiveRun(payload.new as AgentRun)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(stepsChannel)
      supabase.removeChannel(runChannel)
    }
  }, [runId, updateStep, setActiveRun])
}
