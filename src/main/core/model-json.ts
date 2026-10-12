import type { AiRuntime } from './ai-client'
import { jsonrepair } from 'jsonrepair'

type Message = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export function parseModelJson(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  // Reject empty or visibly incomplete responses.
  if (!cleaned.startsWith('{') || !cleaned.endsWith('}')) {
    throw new Error('The model returned an incomplete JSON object')
  }

  let value: unknown

  try {
    value = JSON.parse(cleaned)
  } catch {
    try {
      const repaired = jsonrepair(cleaned)
      value = JSON.parse(repaired)
    } catch {
      throw new Error(
        'The model returned JSON that could not be parsed or repaired'
      )
    }
  }

  if (
    value === null ||
    typeof value !== 'object' ||
    Array.isArray(value)
  ) {
    throw new Error('Expected a JSON object')
  }

  return value
}

export async function askJson(
  runtime: AiRuntime,
  prompt: string
): Promise<unknown> {
  const messages: Message[] = [
    {
      role: 'system',
      content: [
        'Return exactly one valid JSON object.',
        'Use double quotes for property names and strings.',
        'Escape quotes and newlines inside string values.',
        'No Markdown, comments, trailing commas, or explanation.',
        'Ground all claims in the supplied evidence.'
      ].join(' ')
    },
    { role: 'user', content: prompt }
  ]

  let jsonMode = true
  let lastProblem = 'No valid JSON was returned'

  for (let attempt = 0; attempt < 3; attempt++) {
    let completion

    try {
      completion = await runtime.client.chat.completions.create({
        model: runtime.model,
        messages,
        stream: false,
        ...(jsonMode
          ? { response_format: { type: 'json_object' as const } }
          : {})
      })
    } catch (error) {
      const apiError = error as {
        status?: number
        message?: string
      }

      const unsupportedJsonMode =
        jsonMode &&
        [400, 422].includes(apiError.status ?? 0) &&
        /response_format|json_object|json mode/i.test(
          apiError.message ?? ''
        ) &&
        /unsupported|not supported|does not support|not available|invalid/i.test(
          apiError.message ?? ''
        )

      if (unsupportedJsonMode) {
        jsonMode = false
        continue
      }

      throw new Error(
        'Model request failed. Check your provider, model access, and balance.'
      )
    }

    const choice = completion.choices[0]
    const text = choice?.message.content?.trim() ?? ''

    if (choice?.message.refusal) {
      throw new Error('The model declined the discovery request.')
    }

    if (text && choice?.finish_reason !== 'length') {
      try {
        return parseModelJson(text)
      } catch (error) {
        lastProblem =
          error instanceof Error ? error.message : 'Invalid JSON'
      }
    } else {
      lastProblem =
        choice?.finish_reason === 'length'
          ? 'The JSON response was cut off before completion'
          : 'The model returned no JSON content'
    }

    if (text) {
      messages.push({ role: 'assistant', content: text })
    }

    messages.push({
      role: 'user',
      content: [
        `Your previous response could not be parsed: ${lastProblem}.`,
        'Return the entire corrected JSON object again.',
        'Keep all required fields and use concise descriptions.',
        'Do not include Markdown or explanation.'
      ].join(' ')
    })
  }

  throw new Error(
    `The model did not return valid JSON after retries: ${lastProblem}`
  )
}