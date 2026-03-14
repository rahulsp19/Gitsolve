import OpenAI from 'openai'

/**
 * OpenRouter backup LLM client.
 * Used when Groq rate-limits or for specific model access (deepseek-coder, etc.)
 */

let _client: OpenAI | null = null

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: Deno.env.get('OPENROUTER_API_KEY'),
      baseURL: 'https://openrouter.ai/api/v1',
    })
  }
  return _client
}

/** Available models on OpenRouter */
export const OPENROUTER_MODELS = {
  DEEPSEEK_CODER: 'deepseek/deepseek-coder-33b-instruct',
  MISTRAL: 'mistralai/mixtral-8x7b-instruct',
  LLAMA3_70B: 'meta-llama/llama-3-70b-instruct',
} as const

export async function chatOpenRouter(
  messages: OpenAI.ChatCompletionMessageParam[],
  model = OPENROUTER_MODELS.DEEPSEEK_CODER,
  options: Partial<OpenAI.ChatCompletionCreateParamsNonStreaming> = {}
): Promise<{ content: string; tokens: number }> {
  const client = getClient()
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
