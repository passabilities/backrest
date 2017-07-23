const fs = require('fs')
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
  let root = process.cwd()
  try {
    fs.mkdirSync(`${root}/log`)
  } catch(err) {
    // Do nothing. `log` directory already exist.
  } finally {
    fs.appendFile(`${root}/log/${__ENV__}.log`, message, err => {
      if(err) throw err
    })
  }
}

module.exports = {
  log: (message) => {
    message = buildMessage(message)

    console.log(message)
    log(message)
  }
}
