import { z } from 'zod'

const DeliverySchema = z.object({ url: z.string().url(), scriptTag: z.string().min(1), hash: z.string().min(1) })

export async function publishBatch(targetUrl: string, batchId: string, source: string) {
  const host = process.env.INSTA_ADAPTER_HOST_URL?.replace(/\/+$/, '')
  const token = process.env.INSTA_PUBLISH_TOKEN
  if (!host || !token) throw new Error('Set the existing adapter publisher URL/token in Nexus .env')
  const hostname = new URL(targetUrl).hostname.replace(/[^a-z0-9-]/gi, '-')
  let response: Response
  try {
    response = await fetch(`${host}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ key: `${hostname}-batch-${batchId}`, code: source }),
      signal: AbortSignal.timeout(60_000)
    })
  } catch { throw new Error('Publisher request did not complete; check the existing publisher before retrying') }
  if (!response.ok) throw new Error(`Publisher returned HTTP ${response.status}`)
  return DeliverySchema.parse(await response.json())
}
