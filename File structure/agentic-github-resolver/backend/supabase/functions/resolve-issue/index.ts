import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { issue_id } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Create agent_run record
  const { data: run, error } = await supabase
    .from('agent_runs')
    .insert({ issue_id, status: 'pending' })
    .select()
    .single()

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })

  // Kick off orchestration asynchronously
  EdgeRuntime.waitUntil(
    supabase.functions.invoke('orchestrate-agents', {
      body: { run_id: run.id, issue_id }
    })
  )

  return new Response(JSON.stringify({ run_id: run.id }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
