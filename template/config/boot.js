const fs = require('fs')
const _ = require('lodash')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

// Set default environment to 'development'
global.__ENV__ = process.env.NODE_ENV || 'development'
global.__DEV__ = __ENV__ === 'development'

/*
 *  message - String/Array/Object
 *
 *  Passing an array enables each line in message to be grouped together
 *  rather than being spread thought the logs due to callbacks and multiple
 *  logs at the same time.
 */
global.log = (message) => {
  let append = (obj) => {
    if(typeof obj === 'string') {
      return obj + '\r\n'
    } else if(obj instanceof Array) {
      let str = ''
      _.each(obj, m => str += append(m))
      return str
    } else if(obj instanceof Object) {
      return JSON.stringify(obj, null, 2)
    }
  }
  message = append(message) + '\r\n'

  // output to console and log file.
  console.log(message)
  fs.appendFile(`./log/${__ENV__}.log`, message, err => {
    if(err) throw err
  })
}
// On server start, this will make sure that the `log` directory exist.
try {
  fs.mkdirSync('./log')
} catch(err) {
  // Do nothing. `log` directory already exist.
}

// Use environment defined port or default to 3000
const port = process.env.PORT || 3000

module.exports = (app) => {
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())

  app.listen(port, () => {
    log([
      '=> {{name}} server started.',
      `=> Listening on port: ${port}`,
      `=> Environment: ${__ENV__}`,
      `=> Date: ${new Date().toUTCString()}`
    ])
  })
}
