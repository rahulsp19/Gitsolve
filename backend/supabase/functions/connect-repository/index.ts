import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { full_name } = await req.json()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Get authenticated user
  const authHeader = req.headers.get('Authorization')!
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace('Bearer ', '')
  )
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  // Fetch user's GitHub token from users table
  const { data: dbUser } = await supabase
    .from('users')
    .select('github_token')
    .eq('id', user.id)
    .single()

  if (!dbUser?.github_token) {
    return new Response(
      JSON.stringify({ error: 'GitHub token not found' }),
      { status: 400 }
    )
  }

  const [owner, repo] = full_name.split('/')

  // Fetch repository metadata from GitHub
  const ghRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${dbUser.github_token}`,
      Accept: 'application/vnd.github+json',
    },
  })

  if (!ghRes.ok) {
    return new Response(
      JSON.stringify({ error: `GitHub API error: ${ghRes.status}` }),
      { status: ghRes.status }
    )
  }

  const ghRepo = await ghRes.json()

  // Upsert repository record
  const { data: repoRecord, error: upsertError } = await supabase
    .from('repositories')
    .upsert(
      {
        user_id: user.id,
        github_id: ghRepo.id,
        full_name: ghRepo.full_name,
        default_branch: ghRepo.default_branch,
        language: ghRepo.language,
        settings: { auto_pr: false, confidence_threshold: 0.75 },
      },
      { onConflict: 'github_id' }
    )
    .select()
    .single()

  if (upsertError) {
    return new Response(JSON.stringify({ error: upsertError }), { status: 500 })
  }

  // Register webhook on the repo
  const webhookUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/github-webhook`
  const webhookSecret = Deno.env.get('GITHUB_WEBHOOK_SECRET')!

  const hookRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/hooks`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dbUser.github_token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['issues', 'pull_request', 'pull_request_review'],
        config: { url: webhookUrl, content_type: 'json', secret: webhookSecret },
      }),
    }
  )

  if (hookRes.ok) {
    const hook = await hookRes.json()
    await supabase
      .from('repositories')
      .update({ webhook_id: hook.id })
      .eq('id', repoRecord.id)
  }

  return new Response(
    JSON.stringify({ repository: repoRecord }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
