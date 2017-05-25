#!/usr/bin/env node

let program = require('commander')

program
  .command('init <name>', 'create blank Backrest template')
  .command('start', 'start the server')

program.parse(process.argv)
