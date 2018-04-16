const cli = require('commander')
const nodemon = require('nodemon')
const { spawn } = require('child_process')
const forever = require('forever')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const { logger } = require('../src')
const {
  startFile,
  pidFile
} = require('../lib/constants')

cli
  .option('-w, --watch', 'Watch for file changes and restart server.')
  .option('-d, --daemon', 'Start server in the background.')
  .option('-I, --inspect', 'Enable the inspection tool for Node.')
  .option('-L, --nolog', 'Disable logging.')
  .parse(process.argv)

let cliArgs = ''

if (cli.inspect) cliArgs += '--inspect '

if(cli.daemon) {
  let child = new forever.startDaemon(startFile, {
    silent: true,
    pidFile
  })

  console.log(`Server started on pid: ${child.pid}`)
  mkdirp(path.dirname(pidFile), err => {
    if(!err) fs.writeFileSync(pidFile, child.pid)
  })
}  else {
  if(cli.watch) {
    console.log('Watching for file changes...')

    cliArgs += '-e "js json" '
    nodemon(`${cliArgs} ${startFile}`)
      .on('restart', files => {
        console.log([
          'Restarting due to changes...',
          files
        ])
      })
  } else {
    spawn(`node ${cliArgs} ${startFile}`, {
      stdio: 'inherit',
      shell: true
    })
  }
}

if (cli.nolog) {
  logger.disable()
}
