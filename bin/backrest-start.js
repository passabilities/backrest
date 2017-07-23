const cli = require('commander')
const nodemon = require('nodemon')
const forever = require('forever')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const {
  startFile,
  pidFile
} = require('../lib/constants')

cli
  .option('-w, --watch', 'Watch for file changes and restart server.')
  .option('-d, --daemon', 'Start server in the background.')
  .parse(process.argv)

if(cli.daemon) {
  let child = new forever.startDaemon(startFile, {
    silent: true,
    pidFile
  })

  console.log(`Server started on pid: ${child.pid}`)
  mkdirp(path.dirname(pidFile), err => {
    if(!err) fs.writeFileSync(pidFile, child.pid)
  })
} else {
  if(cli.watch) {
    console.log('Watching for file changes...')
    nodemon({
      script: startFile,
      ext: 'js json'
    }).on('restart', files => {
      console.log([
        'Restarting due to changes...',
        files
      ])
    })
  } else {
    require(startFile)
  }
}
