#!/usr/bin/env node

const fs = require('fs')
const _ = require('lodash')

let { version } = JSON.parse(fs.readFileSync('./package.json', 'utf8'))

let templatePackage = './template/package.json'
let pkg = JSON.parse(fs.readFileSync(templatePackage, 'utf8'))
_.merge(pkg, { dependencies: { backrest: `^${version}` } })

fs.writeFileSync(templatePackage, JSON.stringify(pkg, null, 2))
