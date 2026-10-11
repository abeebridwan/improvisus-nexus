import { flushAll, init, shutdown } from 'neatlogs'
import { createTelemetryMask } from './redact'

let initialization: Promise<boolean> | undefined
let stopping: Promise<void> | undefined

export function initializeTracing(): Promise<boolean> {
  return initialization ??= initialize()
}

async function initialize(): Promise<boolean> {
  const apiKey = process.env.NEATLOGS_API_KEY?.trim()
  if (!apiKey) return false

  try {
    await init({
      apiKey,
      endpoint: process.env.NEATLOGS_ENDPOINT || undefined,
      workflowName: 'improvisus-nexus',
      tags: ['desktop', 'neatHack-2026'],
      captureLogs: true,
      mask: createTelemetryMask(Object.entries(process.env)
        .filter(([name]) => /(?:KEY|TOKEN|SECRET|PASSWORD)$/.test(name))
        .map(([, value]) => value ?? '')),
      registerShutdownHandlers: false
    })
    return true
  } catch {
    // Do not expose a credential-bearing SDK error or prevent desktop use.
    console.error('neatlogs: initialization failed; tracing is unavailable')
    return false
  }
}

export function stopTracing(): Promise<void> {
  return stopping ??= stop()
}

async function stop(): Promise<void> {
  try {
    if (!await flushAll(5_000)) console.error('neatlogs: buffered telemetry was not fully exported')
  } finally {
    if (!await shutdown('desktop.quit', 5_000)) console.error('neatlogs: telemetry shutdown did not complete')
  }
}
