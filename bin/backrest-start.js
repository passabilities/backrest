const cli = require('commander')
const nodemon = require('nodemon')
const forever = require('forever')
const fs = require('fs')
const mkdirp = require('mkdirp')

const logger = require('../src/logger')
const {
  startFile,
  pidPath
} = require('../lib/constants')

cli
  .option('-w, --watch', 'Watch for file changes and restart server.')
  .option('-d, --daemon', 'Start server in the background.')
  .parse(process.argv)

if(cli.daemon) {
  let child = forever.startDaemon(startFile)

  logger.log(`Server started on pid: ${child.pid}`)
  mkdirp(pidPath, err => {
    if(!err) fs.writeFileSync(`${pidPath}/server.pid`, child.pid)
  })
} else {
  if(cli.watch) {
    logger.log('Watching for file changes...')
    nodemon({
      script: startFile,
      ext: 'js json'
    }).on('restart', files => {
      logger.log([
        'Restarting due to changes...',
        files
      ])
    })
  } else {
    require(startFile)
  }
}
