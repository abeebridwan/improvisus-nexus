import { flush, init, shutdown } from 'neatlogs'

export async function initializeTracing(): Promise<boolean> {
  const apiKey = process.env.NEATLOGS_API_KEY?.trim()
  if (!apiKey) return false

  await init({
    apiKey,
    endpoint: process.env.NEATLOGS_ENDPOINT || undefined,
    workflowName: 'improvisus-nexus',
    tags: ['desktop', 'neatHack-2026'],
    captureLogs: true,
    registerShutdownHandlers: false
  })
  return true
}

export async function stopTracing(): Promise<void> {
  try {
    if (!await flush()) console.error('neatlogs: buffered telemetry was not fully exported')
  } finally {
    if (!await shutdown()) console.error('neatlogs: telemetry shutdown did not complete')
  }
}
