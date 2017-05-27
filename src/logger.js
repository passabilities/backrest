const _ = require('lodash')

function buildMessage(obj) {
  if(typeof obj === 'string') {
    return obj + '\r\n'
  } else if(obj instanceof Array) {
    let str = ''
    _.each(obj, m => str += buildMessage(m))
    return str
  } else if(obj instanceof Object) {
    return JSON.stringify(obj, null, 2)
  }
}

function log(message) {
  // Make sure the `log` directory exist.
  try {
    let root = process.pwd()

    fs.mkdirSync(`${root}/log`)

    fs.appendFile(`${root}/log/${__ENV__}.log`, message, err => {
      if(err) throw err
    })
  } catch(err) {
    // Do nothing. `log` directory already exist.
  }
}

module.exports = {
  log: (message) => {
    message = buildMessage(message)

    console.log(message)
    log(message)
  }
}
