const cli = require('commander')
const nodemon = require('nodemon')
const { spawn } = require('child_process')
const forever = require('forever')
const fs = require('fs')
const path = require('path')
const mkdirp = require('mkdirp')

const { logger } = require('../src')
const { startFile, pidFile } = require('../lib/constants')

cli
  .option('-w, --watch', 'Watch for file changes and restart server.')
  .option('-d, --daemon', 'Start server in the background.')
  .option('-I, --inspect', 'Enable the inspection tool for Node.')
  .option('-L, --nolog', 'Disable logging.')
  .option('-p, --path <dirPath>', 'Custom path to project.')
  .parse(process.argv)

let cliArgs = ''
let foreverSettings = {}
let nodemonSettings = ''

if (cli.inspect) cliArgs += '--inspect '

if (cli.path) {
  foreverSettings.workingDir = cli.path
  nodemonSettings += `--cwd ${cli.path} `
}

if(cli.daemon) {
  let child = new forever.startDaemon(startFile, {
    // ...foreverSettings,
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

    nodemonSettings += '-e "js json" '
  } else {
    let root = cli.path ? cli.path : process.cwd()
    root = path.resolve(root)
    nodemonSettings += `--ignore *.* `
  }

  nodemon(`${cliArgs} ${startFile} ${nodemonSettings}`)
    .on('restart', files => {
      console.log(
        'Restarting due to changes...',
        ...files
      )
    })
}

if (cli.nolog) {
  logger.disable()
}
