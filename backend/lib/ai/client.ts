import OpenAI from 'openai'

// ─── Groq Client (Primary LLM) ──────────────────────────────────────────────
let _groq: OpenAI | null = null

export function getGroq(): OpenAI {
  if (!_groq) {
    _groq = new OpenAI({
      apiKey: Deno.env.get('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return _groq
}

// ─── OpenRouter Client (Backup LLM) ─────────────────────────────────────────
let _openrouter: OpenAI | null = null

export function getOpenRouter(): OpenAI {
  if (!_openrouter) {
    _openrouter = new OpenAI({
      apiKey: Deno.env.get('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
  return _openrouter
}

// ─── Chat Helpers ────────────────────────────────────────────────────────────

export async function chat(
  messages: OpenAI.ChatCompletionMessageParam[],
  model = 'mixtral-8x7b-32768',
  options: Partial<OpenAI.ChatCompletionCreateParamsNonStreaming> = {}
): Promise<{ content: string; tokens: number }> {
  const client = getGroq()
  try {
    const response = await client.chat.completions.create({
      model,
      messages,
      temperature: 0.1,
      ...options,
    })
    return {
      content: response.choices[0].message.content ?? '',
      tokens: response.usage?.total_tokens ?? 0,
    }
  } catch (err) {
    // Fallback to OpenRouter if Groq rate-limits
    console.warn('[AI] Groq failed, falling back to OpenRouter:', err)
    return chatOpenRouter(messages, 'mistralai/mixtral-8x7b-instruct', options)
  }
}

export async function chatOpenRouter(
  messages: OpenAI.ChatCompletionMessageParam[],
  model = 'mistralai/mixtral-8x7b-instruct',
  options: Partial<OpenAI.ChatCompletionCreateParamsNonStreaming> = {}
): Promise<{ content: string; tokens: number }> {
  const client = getOpenRouter()
  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.1,
    ...options,
  })
  return {
    content: response.choices[0].message.content ?? '',
    tokens: response.usage?.total_tokens ?? 0,
  }
}

export async function chatJSON<T>(
  messages: OpenAI.ChatCompletionMessageParam[],
  model = 'mixtral-8x7b-32768'
): Promise<{ data: T; tokens: number }> {
  const { content, tokens } = await chat(messages, model, {
    response_format: { type: 'json_object' },
  })
  return { data: JSON.parse(content) as T, tokens }
}
