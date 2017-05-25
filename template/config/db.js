const _ = require('lodash')

let config = {

}

switch (__ENV__) {
  case 'development':
    _.extend(config, {

    })
    break

  case 'production':
    _.extend(config, {

    })
    break

  default:
    console.error(`Environment '${__ENV__}' does not exist. Could not connect to the database.`)
}

module.export = config
