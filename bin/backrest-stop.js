const forever = require('forever')
const fs = require('fs')

const {
  startFile,
  pidFile
} = require('../lib/constants')

fs.unlink(pidFile, () => {
  forever.stop(startFile)
})
