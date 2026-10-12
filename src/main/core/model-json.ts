import type { AiRuntime } from './ai-client'

export function parseModelJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('The model returned no JSON object')
  return JSON.parse(cleaned.slice(start, end + 1))
}

export async function askJson(runtime: AiRuntime, prompt: string): Promise<unknown> {
  let text: string | null | undefined
  try {
    const response = await runtime.client.chat.completions.create({
      model: runtime.model,
      messages: [
        { role: 'system', content: 'Return one JSON object only. Ground all claims in the supplied evidence.' },
        { role: 'user', content: prompt }
      ]
    })
    text = response.choices[0]?.message?.content
  } catch {
    throw new Error('Generation request failed. Check provider/model access and retry.')
  }
  if (!text) throw new Error('The generation model returned no content')
  return parseModelJson(text)
}
