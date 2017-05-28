const nodemon = require('nodemon')

const logger = require('../src/logger')

nodemon({
  script: `${__dirname}/../start.js`,
  ext: 'js json'
})

nodemon.on('restart', files => {
  logger.log([
    'Restarting due to changes...',
    files
  ])
})
