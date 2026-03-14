import OpenAI from 'openai'

let _openai: OpenAI | null = null

export function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY') })
  }
  return _openai
}

export async function chat(
  messages: OpenAI.ChatCompletionMessageParam[],
  model = 'gpt-4o',
  options: Partial<OpenAI.ChatCompletionCreateParamsNonStreaming> = {}
): Promise<{ content: string; tokens: number }> {
  const openai = getOpenAI()
  const response = await openai.chat.completions.create({
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
  model = 'gpt-4o'
): Promise<{ data: T; tokens: number }> {
  const { content, tokens } = await chat(messages, model, {
    response_format: { type: 'json_object' },
  })
  return { data: JSON.parse(content) as T, tokens }
}
