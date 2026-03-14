import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let reqBody;
    try {
      reqBody = await req.json();
    } catch(e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    const { full_name } = reqBody;
    
    if (!full_name) {
      return new Response(JSON.stringify({ error: 'full_name parameter is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    
    console.log("Connecting repository: ", full_name);

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
      console.error("Auth Error:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Fetch user's GitHub token from users table
    const { data: dbUser, error: dbUserError } = await supabase
      .from('users')
      .select('github_token')
      .eq('id', user.id)
      .single()

    if (dbUserError || !dbUser?.github_token) {
      console.error("User token not found in DB. Error:", dbUserError);
      return new Response(
        JSON.stringify({ error: 'GitHub token not found. Please log out and back in again to sync your token.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      const errText = await ghRes.text();
      console.error(`GitHub API error ${ghRes.status}:`, errText);
      return new Response(
        JSON.stringify({ error: `GitHub API error: ${ghRes.status}`, details: errText }),
        { status: ghRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.error("Supabase upsert error:", upsertError);
      return new Response(JSON.stringify({ error: 'Failed to save repository', details: upsertError }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
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
    } else {
      const hookErr = await hookRes.text();
      console.warn("Failed to create webhook (non-fatal):", hookRes.status, hookErr);
    }

    return new Response(
      JSON.stringify({ success: true, repository: repoRecord }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error("Fatal function error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
