import { createApp } from './app'
import { config } from './config'
import { logEvent } from './log'

createApp().listen(config.port, () => {
  logEvent('server_started', { port: config.port })
})
