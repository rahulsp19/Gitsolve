import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const signature = req.headers.get('x-hub-signature-256') ?? ''
  const payload = await req.text()

  // Verify HMAC signature
  const secret = Deno.env.get('GITHUB_WEBHOOK_SECRET')!
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  const expected = 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')

  if (signature !== expected) {
    return new Response('Unauthorized', { status: 401 })
  }

  const event = req.headers.get('x-github-event')
  const body = JSON.parse(payload)

  if (event === 'issues' && body.action === 'opened') {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Find repository record
    const { data: repo } = await supabase
      .from('repositories')
      .select('id, settings')
      .eq('github_id', body.repository.id)
      .single()

    if (repo?.settings?.auto_pr) {
      // Auto-trigger if enabled
      await supabase.functions.invoke('resolve-issue', {
        body: { repository_id: repo.id, github_issue_number: body.issue.number }
      })
    }
  }

  return new Response('OK', { status: 200 })
})
