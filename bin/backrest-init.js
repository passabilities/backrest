const program = require('commander')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const hbs = require('handlebars')

program
  .action((name) => {
    let data = {
      name
    }

    _.each(glob.sync(`${__dirname}/../template/**/*`), (file) => {
      let pathName = `${process.cwd()}/${_.last(file.split('template'))}`
      if(fs.statSync(file).isDirectory()) {
        console.log(`Creating directory '${path.dirname(file)}'`)

        fs.mkdirSync(pathName)
      } else {
        console.log(`Building file ${path.basename(file)}`)

        let source = fs.readFileSync(file, 'utf8')
        let template = hbs.compile(source)
        fs.writeFileSync(pathName, template(data))
      }
    })
  })

program.parse(process.argv)
