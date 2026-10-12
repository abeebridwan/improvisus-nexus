import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { launchWebMCPBrowser } from './browser'
import type { Emit, Plan, TestResult } from './types'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function verifyBatch(input: {
  plans: Plan[]; mode: 'local' | 'url'; siteUrl: string
  combinedSource?: string; evidenceDirectory: string
}, emit: Emit): Promise<TestResult[]> {
  const browser = await launchWebMCPBrowser()
  const results: TestResult[] = []
  try {
    for (const plan of input.plans) {
      for (const [index, test] of plan.tests.entries()) {
        emit({ stage: 'verifying', workflowId: plan.workflowId, message: `${plan.name}: ${test.name}` })
        const context = await browser.newContext({ bypassCSP: input.mode === 'url' })
        const page = await context.newPage()
        const directory = path.join(input.evidenceDirectory, plan.workflowId)
        await mkdir(directory, { recursive: true })
        const screenshot = path.join(directory, `test-${index + 1}.png`)
        const record: TestResult = {
          workflowId: plan.workflowId, toolName: plan.toolName, testName: test.name, pass: false
        }
        try {
          const startUrl = input.mode === 'url' ? plan.startUrl : input.siteUrl
          if (!startUrl) throw new Error('Workflow starting URL is missing')
          const target = test.startPath ? new URL(test.startPath, startUrl).href : startUrl
          if (new URL(target).origin !== new URL(input.siteUrl).origin) throw new Error('Test leaves the batch origin')
          await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 30_000 })
          if (new URL(page.url()).origin !== new URL(input.siteUrl).origin) throw new Error('Website redirected to a different origin')
          await page.waitForFunction(() => Boolean((document as any).modelContext), undefined, { timeout: 10_000 })
          const cdp: any = await context.newCDPSession(page)
          const tools: any[] = []
          const responses: any[] = []
          cdp.on('WebMCP.toolsAdded', (event: any) => tools.push(...(event.tools ?? [])))
          cdp.on('WebMCP.toolResponded', (event: any) => responses.push(event))
          await cdp.send('WebMCP.enable')
          if (input.mode === 'url') {
            if (!input.combinedSource) throw new Error('Combined adapter source is missing')
            await page.addScriptTag({ content: input.combinedSource })
          }
          const deadline = Date.now() + 15_000
          while (!tools.some(tool => tool.name === plan.toolName) && Date.now() < deadline) await sleep(100)
          if (!tools.some(tool => tool.name === plan.toolName)) throw new Error(`${plan.toolName} was not discovered through WebMCP`)
          const frameTree = await cdp.send('Page.getFrameTree')
          const invocation = await cdp.send('WebMCP.invokeTool', {
            frameId: frameTree.frameTree.frame.id, toolName: plan.toolName, input: test.input
          })
          let response: any
          const end = Date.now() + 30_000
          while (Date.now() < end) {
            response = responses.find(item => item.invocationId === invocation.invocationId)
            if (response) break
            await sleep(50)
          }
          if (!response) throw new Error('WebMCP invocation timed out')
          if (response.status !== 'Completed') throw new Error('WebMCP invocation did not complete successfully')
          if (!JSON.stringify(response.output).toLowerCase().includes(test.expectedText.toLowerCase())) {
            throw new Error(`Expected result was not returned: ${test.expectedText}`)
          }
          await page.screenshot({ path: screenshot, fullPage: true })
          record.pass = true
          record.screenshot = screenshot
        } catch (error) {
          record.error = error instanceof Error ? error.message : 'Browser verification failed'
          await page.screenshot({ path: screenshot, fullPage: true }).then(() => { record.screenshot = screenshot }).catch(() => {})
        } finally { await context.close() }
        results.push(record)
        emit({ stage: record.pass ? 'test-passed' : 'test-failed', workflowId: plan.workflowId,
          message: `${plan.name}: ${test.name} ${record.pass ? 'PASS' : 'FAIL'}${record.error ? ': ' + record.error : ''}${record.screenshot ? ' — ' + record.screenshot : ''}` })
      }
    }
  } finally { await browser.close() }
  return results
}
