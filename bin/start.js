const app = require('../app')
const logger = require('../src/logger')

const port = process.env.PORT || 7777

const server = app.listen(port, () => {
  logger.log([
    '=> Backrest server started.',
    `=> Listening on port: ${port}`,
    `=> Environment: ${__ENV__}`,
    `=> Date: ${new Date().toUTCString()}`
  ])
})

function gracefulShutdown() {
  server.close(process.exit)
  // Force exit if took too long
  setTimeout(process.exit, 10*1000)
}
process.on('SIGTERM', gracefulShutdown) // kill
process.on('SIGINT', gracefulShutdown) // Ctrl-C
