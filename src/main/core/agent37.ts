import { parseModelJson } from './model-json'
import { UrlCatalogSchema } from './types'

export async function discoverCloudWorkflows(targetUrl: string) {
  const key = process.env.AGENT37_API_KEY
  const base = (process.env.AGENT37_INSTANCE_URL ||
    (process.env.AGENT37_INSTANCE_ID ? `https://${process.env.AGENT37_INSTANCE_ID}.agent37.app` : '')).replace(/\/+$/, '')
  if (!key || !base) throw new Error('Set the existing Agent37 instance URL/ID and key in Nexus .env')
  const url = new URL(targetUrl)
  if (!['https:', 'http:'].includes(url.protocol) || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error('URL mode needs a public HTTP/HTTPS website')
  }
  const prompt = `Use your browser to inspect ${url.href}.
Discover distinct existing READ-ONLY workflows on this website. Return up to 10 observed workflows; do not invent workflows to fill a quota.
Observe rendered controls and stable selectors, perform safe search/filter/navigation, and establish example expected results.
Do not purchase, delete, submit consequential forms, create accounts, change server data, or generate adapter code.
Return JSON: {"workflows":[{
"mode":"url","name":"workflow title","goal":"what it achieves","startUrl":"actual page URL",
"inputs":[{"name":"input name","selector":"observed stable selector","description":"meaning"}],
"actions":[{"type":"fill|click|select|wait","selector":"observed selector","description":"action","inputName":"optional input name"}],
"result":{"selector":"observed result area","description":"result meaning"},
"tests":[{"name":"observed example","input":{"actualInputName":"example value"},"expectedText":"observed output substring"}]
}]}. Every workflow must have at least one observed test. All start URLs must have origin ${url.origin}.
Avoid workflows whose execution requires navigation away from the current document, since a WebMCP invocation must return from this document.`
  let response: Response
  try {
    response = await fetch(`${base}/v1/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Agent37-Key': key },
      body: JSON.stringify({ input: prompt, stream: false }),
      signal: AbortSignal.timeout(240_000)
    })
  } catch { throw new Error('Could not complete Agent37 discovery') }
  if (!response.ok) throw new Error(`Agent37 discovery failed with HTTP ${response.status}`)
  const data = await response.json() as {
    status?: string; session_id?: string; output_text?: string
    output?: { content?: { text?: string; output_text?: string }[] }[]
  }
  if (data.status !== 'completed') throw new Error(`Agent37 did not complete discovery (${data.status ?? 'missing status'})`)
  const text = data.output_text ?? data.output?.flatMap(item => item.content ?? [])
    .map(item => item.text ?? item.output_text ?? '').join('\n')
  if (!text) throw new Error('Agent37 returned no discovery content')
  const catalog = UrlCatalogSchema.parse(parseModelJson(text))
  for (const workflow of catalog.workflows) {
    if (new URL(workflow.startUrl).origin !== url.origin) throw new Error('A discovered workflow belongs to a different origin')
  }
  return { workflows: catalog.workflows, sessionId: data.session_id }
}
