#!/usr/bin/env node

const cli = require('commander')
const fs = require('fs')

let { version } = JSON.parse(fs.readFileSync(`${__dirname}/../package.json`, 'utf8'))

cli
  .version(version)
  .command('init <name>', 'create blank Backrest template').alias('i')
  .command('start', 'start the server').alias('s')
  .command('stop', 'stop the server')
  .command('generator <controllerName>', 'generate a controller file').alias('g')
  .parse(process.argv)
