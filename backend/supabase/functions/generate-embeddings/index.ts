import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const JINA_API_URL = 'https://api.jina.ai/v1/embeddings'

serve(async (req) => {
  const { repository_id, file_path, chunks } = await req.json()
  const jinaKey = Deno.env.get('JINA_API_KEY')
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Generate embeddings via Jina AI (code-optimized model)
  const texts = chunks.map((c: { context: string }) => c.context)
  const jinaResponse = await fetch(JINA_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jinaKey}`,
    },
    body: JSON.stringify({
      model: 'jina-embeddings-v2-base-code',
      input: texts,
    }),
  })

  if (!jinaResponse.ok) {
    return new Response(
      JSON.stringify({ error: `Jina API error: ${jinaResponse.status}` }),
      { status: 500 }
    )
  }

  const { data: embeddings } = await jinaResponse.json()

  const rows = chunks.map((chunk: Record<string, unknown>, i: number) => ({
    repository_id,
    file_path,
    chunk_index: i,
    chunk_type: chunk.type,
    content: chunk.content,
    start_line: chunk.startLine,
    end_line: chunk.endLine,
    language: chunk.language,
    embedding: embeddings[i].embedding,
  }))

  const { error } = await supabase
    .from('code_embeddings')
    .upsert(rows, { onConflict: 'repository_id,file_path,chunk_index' })

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  return new Response(JSON.stringify({ indexed: rows.length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
