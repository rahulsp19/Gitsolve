import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import OpenAI from 'https://esm.sh/openai@4'

serve(async (req) => {
  const { repository_id, file_path, chunks } = await req.json()
  const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const texts = chunks.map((c: { context: string }) => c.context)
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: texts,
    dimensions: 3072,
  })

  const rows = chunks.map((chunk: Record<string, unknown>, i: number) => ({
    repository_id,
    file_path,
    chunk_index: i,
    chunk_type: chunk.type,
    content: chunk.content,
    start_line: chunk.startLine,
    end_line: chunk.endLine,
    language: chunk.language,
    embedding: response.data[i].embedding,
  }))

  const { error } = await supabase
    .from('code_embeddings')
    .upsert(rows, { onConflict: 'repository_id,file_path,chunk_index' })

  if (error) return new Response(JSON.stringify({ error }), { status: 500 })
  return new Response(JSON.stringify({ indexed: rows.length }), {
    headers: { 'Content-Type': 'application/json' }
  })
})
