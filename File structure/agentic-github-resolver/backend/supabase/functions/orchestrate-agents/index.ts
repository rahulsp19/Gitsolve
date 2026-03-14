import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { run_id, issue_id } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  await supabase.from('agent_runs').update({
    status: 'running',
    started_at: new Date().toISOString()
  }).eq('id', run_id)

  try {
    // Import and run orchestrator
    // (Dynamic import used to keep edge function bundle small)
    const { AgentOrchestrator } = await import('../../agents/orchestrator/index.ts')
    const orchestrator = new AgentOrchestrator()

    const context = {
      run_id,
      issue_id,
      repository_id: '',
      step_logs: [],
    }

    const result = await orchestrator.run(context)

    await supabase.from('agent_runs').update({
      status: result.pr_result ? 'success' : 'failed',
      completed_at: new Date().toISOString(),
      context: result,
    }).eq('id', run_id)

  } catch (err) {
    await supabase.from('agent_runs').update({
      status: 'failed',
      error_message: String(err),
      completed_at: new Date().toISOString(),
    }).eq('id', run_id)
  }

  return new Response('done')
})
