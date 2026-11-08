import { createApp } from './app'
import { config } from './config'

createApp().listen(config.port, () => {
  console.log(`Acme Invoicing API on http://localhost:${config.port}`)
})
