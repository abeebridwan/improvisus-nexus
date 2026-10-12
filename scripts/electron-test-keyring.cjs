// Playwright's Electron loader forces basic password storage and a mock macOS
// keychain. This additional Node preload runs after that loader, before app ready,
// to exercise the real OS store. It is used only by the isolated desktop test.
const { app } = require('electron')
app.commandLine.removeSwitch('password-store')
app.commandLine.removeSwitch('use-mock-keychain')
const backend = process.env.NEXUS_TEST_PASSWORD_STORE
if (backend) {
  if (!['gnome-libsecret', 'kwallet', 'kwallet5', 'kwallet6'].includes(backend)) throw new Error('Unsupported test keyring')
  app.commandLine.appendSwitch('password-store', backend)
}
