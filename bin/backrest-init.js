const cli = require('commander')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const hbs = require('handlebars')

cli
  .action((name) => {
    let data = {
      name
    }

    let projectPath = `${process.cwd()}/${name}`
    fs.mkdirSync(projectPath)

    _.each(glob.sync(`${__dirname}/../template/**/*`), (file) => {
      let pathName = `${projectPath}/${_.last(file.split('template/'))}`
      if(fs.statSync(file).isDirectory()) {
        console.log(`Creating directory '${path.dirname(pathName)}'`)

        fs.mkdirSync(pathName)
      } else {
        console.log(`Building file ${path.basename(pathName)}`)

        let source = fs.readFileSync(file, 'utf8')
        let template = hbs.compile(source)
        fs.writeFileSync(pathName, template(data))
      }
    })
  })
  .parse(process.argv)
