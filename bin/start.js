const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const logger = require('../src/logger')

// Set default environment to 'development'
global.__ENV__ = process.env.NODE_ENV || 'development'
global.__DEV__ = __ENV__ === 'development'

const app = require('express')()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use('/', require('../lib/routing/buildRoutes'))

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
process.on ('SIGTERM', gracefulShutdown) // kill
process.on ('SIGINT', gracefulShutdown) // Ctrl-C
