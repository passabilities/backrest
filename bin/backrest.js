#!/usr/bin/env node

let cli = require('commander')

cli
  .command('init <name>', 'create blank Backrest template').alias('i')
  .command('start', 'start the server').alias('s')
  .parse(process.argv)
