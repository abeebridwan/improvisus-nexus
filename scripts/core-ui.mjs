// Integration fixtures replace external API responses only. The Electron app,
// preload/IPC, Core controller, Git operations and WebMCP Chromium verification
// remain production code. No real keys, accounts or published adapters are used.
import assert from 'node:assert/strict'
import http from 'node:http'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { _electron } from 'playwright'
import electron from 'electron'
import { desktopEnvironment, prepareLinuxSandbox } from './electron-env.mjs'

const root = await mkdtemp(join(tmpdir(), 'nexus-core-ui-'))
const project = join(root, 'website')
const profile = join(root, 'profile')
const git = (...args) => execFileSync('git', ['-C', project, ...args], { encoding: 'utf8' }).trim()
const website = `<!doctype html><html><head><title>Nexus fixture website</title></head><body>
<h1>People directory</h1><input id="query" aria-label="Search people"><button id="search">Search</button><p id="results">Ada, Grace</p>
<script>document.querySelector('#search').onclick=()=>{document.querySelector('#results').textContent=['Ada','Grace'].filter(name=>name.toLowerCase().includes(document.querySelector('#query').value.toLowerCase())).join(', ')}</script></body></html>`
const server = http.createServer((_req, response) => { response.writeHead(200, { 'Content-Type': 'text/html' }); response.end(website) })
let desktop
try {
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.2', accept) })
  const siteUrl = `http://127.0.0.2:${server.address().port}/`
  await mkdir(join(project, 'src'), { recursive: true })
  const vite = resolve('node_modules/vite/bin/vite.js')
  await writeFile(join(project, 'package.json'), JSON.stringify({ name: 'nexus-ui-fixture', private: true, type: 'module', scripts: { build: `node "${vite}" build`, dev: `node "${vite}"` } }))
  await writeFile(join(project, 'index.html'), '<!doctype html><title>Nexus local fixture</title><h1>People directory</h1><script type="module" src="/src/main.ts"></script>')
  await writeFile(join(project, '.gitignore'), 'dist/\nnode_modules/\n')
  await writeFile(join(project, 'src/main.ts'), Array.from({ length: 6 }, (_, index) => `export function search${index + 1}(query: string) { return ['Ada','Grace'].filter(name => name.toLowerCase().includes(query.toLowerCase())) }`).join('\n'))
  git('init', '-b', 'main'); git('config', 'user.name', 'Nexus fixture'); git('config', 'user.email', 'fixture@example.invalid')
  git('add', '.'); git('commit', '-m', 'test: initialize isolated website')
  const originalHead = git('rev-parse', 'HEAD')
  const originalSource = await readFile(join(project, 'src/main.ts'), 'utf8')
  const env = { ...desktopEnvironment(), NEATLOGS_API_KEY: '', NEXUS_TRACE_STDOUT: '', AGENT37_API_KEY: 'fixture-agent-key', AGENT37_INSTANCE_URL: 'https://agent.fixture.invalid', INSTA_ADAPTER_HOST_URL: 'https://publisher.fixture.invalid', INSTA_PUBLISH_TOKEN: 'fixture-publish-token' }
  delete env.ELECTRON_RENDERER_URL
  prepareLinuxSandbox(electron, env)
  desktop = await _electron.launch({ args: ['-r', fileURLToPath(new URL('./electron-test-keyring.cjs', import.meta.url)), '.', `--user-data-dir=${profile}`], env, chromiumSandbox: true, timeout: 30_000 })
  const page = await desktop.firstWindow()
  await page.getByRole('heading', { name: 'What will you do with Nexus?' }).waitFor()
  const storage = await page.evaluate(() => window.nexus.providers.status())
  if (!storage.ok || !storage.value.secureStorage) throw new Error('Core UI integration requires an unlocked OS keyring. Use NEXUS_TEST_PASSWORD_STORE=gnome-libsecret on GNOME.')
  await desktop.evaluate((_electron, siteUrl) => {
    const originalFetch = globalThis.fetch
    globalThis.__coreFixtures = { badGeneration: false, badVerification: false, hold: false, published: [] }
    const candidate = (mode, index) => ({ mode, name: `Search people ${index}`, goal: `Read-only directory query ${index}`, tests: [{ name: `Find Ada ${index}`, input: { query: 'Ada' }, expectedText: globalThis.__coreFixtures.badVerification ? 'never-present-fixture-output' : 'Ada' }], ...(mode === 'local'
      ? { files: ['src/main.ts'], entryFile: 'src/main.ts', exportedFunction: `search${index}` }
      : { startUrl: siteUrl, inputs: [{ name: 'query', selector: '#query', description: 'Search text' }], actions: [{ type: 'fill', selector: '#query', description: 'Enter search', inputName: 'query' }, { type: 'click', selector: '#search', description: 'Filter people' }], result: { selector: '#results', description: 'Matching people' } }) })
    globalThis.fetch = async (input, options) => {
      const url = typeof input === 'string' ? input : input.url ?? String(input)
      if (url === 'https://api.openai.com/v1/models') return Response.json({ data: [{ id: 'gpt-4.1-mini' }] })
      if (url === 'https://agent.fixture.invalid/v1/responses') {
        while (globalThis.__coreFixtures.hold) await new Promise(resolve => setTimeout(resolve, 10))
        await new Promise(resolve => setTimeout(resolve, 180))
        return Response.json({ status: 'completed', session_id: 'fixture-session', output_text: JSON.stringify({ workflows: Array.from({ length: 6 }, (_, index) => candidate('url', index + 1)) }) })
      }
      if (url === 'https://publisher.fixture.invalid/publish') {
        const request = JSON.parse(options.body)
        globalThis.__coreFixtures.published.push(request)
        await new Promise(resolve => setTimeout(resolve, 180))
        return Response.json({ url: 'https://publisher.fixture.invalid/adapter.js', scriptTag: '<script src="https://publisher.fixture.invalid/adapter.js"></script>', hash: 'fixture-integrity-hash' })
      }
      if (url === 'https://api.openai.com/v1/chat/completions') {
        while (globalThis.__coreFixtures.hold) await new Promise(resolve => setTimeout(resolve, 10))
        const request = JSON.parse(options.body)
        const prompt = request.messages.find(message => message.role === 'user').content
        await new Promise(resolve => setTimeout(resolve, 180))
        let content
        if (prompt.startsWith('Inspect this repository source')) {
          content = { workflows: Array.from({ length: 6 }, (_, index) => candidate('local', index + 1)) }
        } else {
          const evidence = JSON.parse(prompt.split('WORKFLOW EVIDENCE:\n')[1].split('\nReturn ')[0])
          const tool = JSON.stringify(evidence.toolName)
          const common = `name:${tool},description:'Search people',inputSchema:{type:'object',additionalProperties:false,properties:{query:{type:'string'}},required:['query']},annotations:{readOnlyHint:true,consequentialHint:false}`
          const adapterSource = evidence.mode === 'local'
            ? `import { ${evidence.exportedFunction} } from '../main'; const modelContext=(document as any).modelContext; if(modelContext) { void modelContext.registerTool({${common},execute:async(input:unknown,options:{signal:AbortSignal})=>{options.signal.throwIfAborted();return ${evidence.exportedFunction}((input as {query:string}).query)}}); }`
            : `await document.modelContext.registerTool({${common},execute:async(input,{signal})=>{signal.throwIfAborted();document.querySelector('#query').value=input.query;document.querySelector('#search').click();return {names:document.querySelector('#results').textContent}}});`
          content = { description: 'Read matching people from the actual fixture source or DOM', adapterSource: globalThis.__coreFixtures.badGeneration ? 'invalid fixture adapter' : adapterSource }
        }
        return Response.json({ id: 'fixture-completion', object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content: JSON.stringify(content) }, finish_reason: 'stop' }] })
      }
      if (url.startsWith('http://127.0.0.1:4173')) return originalFetch(input, options)
      throw new Error('Unexpected external request in isolated Core test')
    }
  }, siteUrl)

  await page.getByRole('radio', { name: /Nexus Core/ }).check()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('API key', { exact: false }).fill('fixture-core-provider-key')
  await page.getByRole('button', { name: 'Check key & load models' }).click()
  await page.getByLabel('Model', { exact: true }).selectOption('gpt-4.1-mini')
  await page.getByRole('button', { name: 'Save & open workspace' }).click()
  await page.getByRole('heading', { name: 'Nexus Core', exact: true }).waitFor()
  const clear = page.getByRole('button', { name: 'Clear', exact: true })
  const target = page.getByLabel('Local project path', { exact: true })
  const discover = page.getByRole('button', { name: 'Discover workflows', exact: true })
  const checkboxes = page.locator('.core-candidate input')
  const fixture = patch => desktop.evaluate((_electron, patch) => Object.assign(globalThis.__coreFixtures, patch), patch)
  async function reset() {
    await clear.click()
    await page.getByRole('heading', { name: 'Run progress', exact: true }).waitFor({ state: 'hidden' })
    assert.equal(await page.locator('#core-target').inputValue(), '')
    assert.equal(await page.locator('.core-candidate').count(), 0)
    assert.equal(await page.locator('.core-error').count(), 0)
    assert.equal(await page.locator('.core-plan').count(), 0)
    assert.equal(await page.locator('.core-success').count(), 0)
  }
  async function discoverLocal() {
    await target.fill(project); await fixture({ hold: true }); await discover.click()
    if (!await clear.isDisabled()) throw new Error(await page.locator('.core-error').textContent({ timeout: 1000 }).catch(() => 'Expected discovery to remain active'))
    await fixture({ hold: false })
    await page.getByRole('heading', { name: '2. Select workflows' }).waitFor()
    await clear.waitFor({ state: 'visible' })
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent === 'Clear').disabled)
  }
  async function prepare(count = 1) {
    for (let i = 0; i < count; i++) await checkboxes.nth(i).check()
    if (count === 5) assert.equal(await checkboxes.nth(5).isDisabled(), true)
    await fixture({ hold: true })
    await page.getByRole('button', { name: /^Generate \d+ capabilit/ }).click()
    assert.equal(await clear.isDisabled(), true)
    await fixture({ hold: false })
    await page.getByRole('heading', { name: '4. Review generated capabilities' }).waitFor()
    assert.equal(await page.getByRole('button', { name: 'Settings', exact: true }).isDisabled(), true)
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent === 'Clear').disabled)
  }

  // Failure and discovery-only reset use the actual controller, without LLM calls.
  await target.fill(join(root, 'missing-project')); await discover.click()
  await page.locator('.core-error').waitFor(); await reset()
  await discoverLocal()
  for (let i = 0; i < 5; i++) await checkboxes.nth(i).check()
  assert.equal(await checkboxes.nth(5).isDisabled(), true)
  await checkboxes.nth(0).uncheck(); assert.equal(await checkboxes.nth(5).isDisabled(), false)
  await reset()

  // Inputs/selections survive mode switches; the controller's single catalog
  // makes the older list explicitly stale after the other mode discovers.
  await discoverLocal(); await checkboxes.nth(0).check()
  await page.getByRole('radio', { name: 'Website URL', exact: true }).check()
  await page.getByRole('textbox', { name: 'Website URL', exact: true }).fill(siteUrl)
  await discover.click()
  await page.getByRole('heading', { name: '2. Select workflows' }).waitFor()
  await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent === 'Clear').disabled)
  await page.getByRole('radio', { name: 'Local project', exact: true }).check()
  assert.equal(await target.inputValue(), project)
  assert.equal(await checkboxes.nth(0).isChecked(), true)
  assert.equal(await page.getByRole('button', { name: 'Generate 1 capability', exact: true }).isDisabled(), true)
  await page.getByRole('radio', { name: 'Website URL', exact: true }).check()
  await reset()
  await page.getByRole('radio', { name: 'Local project', exact: true }).check()
  assert.equal(await target.inputValue(), project)
  assert.equal(await checkboxes.nth(0).isChecked(), true)
  await reset()

  // Clear releases a real pending batch before any application or publication.
  await discoverLocal(); await prepare()
  await page.locator('.core-plan summary').first().click()
  await page.locator('.core-diff summary').click()
  assert.match(await page.locator('.core-diff pre').textContent(), /src\/webmcp/)
  await page.screenshot({ path: 'artifacts/core-review-ui.png', fullPage: true })
  await reset()
  assert.equal(git('rev-parse', 'HEAD'), originalHead)
  assert.equal(await readFile(join(project, 'src/main.ts'), 'utf8'), originalSource)

  // A real failed Chromium invocation exercises backend rollback and error UI.
  await fixture({ badVerification: true }); await discoverLocal(); await prepare()
  await page.getByRole('button', { name: 'Approve & verify', exact: true }).click()
  assert.equal(await clear.isDisabled(), true)
  await page.locator('.core-error').waitFor({ timeout: 60_000 })
  assert.match(await page.locator('.core-error').textContent(), /Expected result was not returned: never-present-fixture-output/)
  assert.equal(git('rev-parse', 'HEAD'), originalHead)
  assert.equal(git('branch', '--show-current'), 'main')
  await reset(); await fixture({ badVerification: false })

  await discoverLocal(); await prepare()
  await page.getByRole('button', { name: 'Approve & verify', exact: true }).click()
  await page.getByRole('heading', { name: '5. Verified results' }).waitFor({ timeout: 60_000 })
  const installedHead = git('rev-parse', 'HEAD')
  assert.notEqual(installedHead, originalHead)
  assert.equal(await page.locator('.core-git dd').nth(1).textContent(), installedHead)
  assert.equal(git('status', '--porcelain'), '')
  await page.screenshot({ path: 'artifacts/core-local-ui.png', fullPage: true })

  await page.getByRole('radio', { name: 'Website URL', exact: true }).check()
  const remoteTarget = page.getByRole('textbox', { name: 'Website URL', exact: true })
  await remoteTarget.fill(siteUrl)
  await page.getByRole('radio', { name: 'Local project', exact: true }).check()
  assert.equal(await target.inputValue(), project)
  assert.equal(await page.locator('.core-git dd').nth(1).textContent(), installedHead)
  await page.getByRole('radio', { name: 'Website URL', exact: true }).check()
  assert.equal(await remoteTarget.inputValue(), siteUrl)
  async function discoverRemote() {
    await remoteTarget.fill(siteUrl); await fixture({ hold: true }); await discover.click()
    assert.equal(await clear.isDisabled(), true)
    await fixture({ hold: false })
    await page.getByRole('heading', { name: '2. Select workflows' }).waitFor()
    await page.waitForFunction(() => ![...document.querySelectorAll('button')].find(button => button.textContent === 'Clear').disabled)
  }
  await fixture({ badGeneration: true }); await discoverRemote(); await checkboxes.nth(0).check()
  await page.getByRole('button', { name: 'Generate 1 capability', exact: true }).click()
  await page.locator('.core-error').waitFor(); await reset(); await fixture({ badGeneration: false })
  await discoverRemote(); await prepare(); await reset()
  assert.equal(await desktop.evaluate(() => globalThis.__coreFixtures.published.length), 0)
  await fixture({ badVerification: true }); await discoverRemote(); await prepare()
  await page.getByRole('button', { name: 'Approve, verify & publish', exact: true }).click()
  await page.locator('.core-error').waitFor({ timeout: 60_000 })
  assert.match(await page.locator('.core-error').textContent(), /Expected result was not returned: never-present-fixture-output/)
  await reset(); await fixture({ badVerification: false })
  assert.equal(await desktop.evaluate(() => globalThis.__coreFixtures.published.length), 0)

  // Five real tools are registered and invoked before fixture publishing.
  await discoverRemote(); await prepare(5)
  await page.getByRole('button', { name: 'Approve, verify & publish', exact: true }).click()
  assert.equal(await clear.isDisabled(), true)
  await page.getByRole('heading', { name: '5. Verified results' }).waitFor({ timeout: 90_000 })
  assert.equal(await page.locator('.core-test-results li').count(), 5)
  assert.equal(await page.getByLabel('Published adapter URL').inputValue(), 'https://publisher.fixture.invalid/adapter.js')
  assert.match(await page.getByLabel('Installation snippet').inputValue(), /<script src=/)
  assert.equal(await desktop.evaluate(() => globalThis.__coreFixtures.published.length), 1)
  await page.screenshot({ path: 'artifacts/core-url-ui.png', fullPage: true })
  await page.setViewportSize({ width: 720, height: 760 })
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true)
  await reset()
  await desktop.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.send('nexus:core:step', { stage: 'test-passed', message: 'late fixture event' }))
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
  assert.equal(await page.getByText('late fixture event').count(), 0)
  assert.equal(await desktop.evaluate(() => globalThis.__coreFixtures.published.length), 1)
  await page.getByRole('radio', { name: 'Local project', exact: true }).check()
  assert.equal(await page.locator('.core-git dd').nth(1).textContent(), installedHead)
  await reset()
  assert.equal(git('rev-parse', 'HEAD'), installedHead)
  assert.equal((await page.evaluate(() => window.nexus.providers.status())).value.active.model, 'gpt-4.1-mini')
  console.log('PASS: Local and URL Core UI through real IPC/controller; five-workflow limit; review/approval; real Git apply/commit/rollback; native Chromium WebMCP execution; fixture publishing; isolated mode state; Clear after discovery/review/failure/success; active Clear lock and late-event rejection; 720px layout; provider retained. External AI, Agent37 and publisher responses were fixtures.')
} finally {
  await desktop?.close()
  await new Promise(resolve => server.close(resolve))
  await rm(root, { recursive: true, force: true })
}
