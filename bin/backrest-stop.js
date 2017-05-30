const forever = require('forever')

const { startFile } = require('../lib/constants')

forever.stop(startFile)
