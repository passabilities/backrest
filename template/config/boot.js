const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const { logger } = require('backrest')

// Set default environment to 'development'
global.__ENV__ = process.env.NODE_ENV || 'development'
global.__DEV__ = __ENV__ === 'development'

// Use environment defined port or default to 3000
const port = process.env.PORT || 3000

module.exports = (app) => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  app.listen(port, () => {
    logger.log([
      '=> {{name}} server started.',
      `=> Listening on port: ${port}`,
      `=> Environment: ${__ENV__}`,
      `=> Date: ${new Date().toUTCString()}`
    ])
  })
}
