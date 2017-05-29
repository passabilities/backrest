const cli = require('commander')
const nodemon = require('nodemon')

const logger = require('../src/logger')

const start = `${__dirname}/start.js`

cli
  .option('-w, --watch', 'Watch for file changes and restart server.')
  .parse(process.argv)

if(cli.watch) {
  logger.log('Watching for file changes...')
  nodemon({
    script: start,
    ext: 'js json'
  }).on('restart', files => {
    logger.log([
      'Restarting due to changes...',
      files
    ])
  })
} else {
  require(start)
}
