const cli = require('commander')
const fs = require('fs')
const hbs = require('handlebars')

cli
  .action((cName) => {
    let cPath = `${process.cwd()}/app/controllers/`
    // Test if controller name was given as camel case or with underscores.
    if(/^[A-Z]/.test(cName)) {
      cPath += cName
        .replace(/^(.)/, (m, c) => c.toLowerCase())
        .replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)
    } else {
      cPath += cName
      cName = cName
        .replace(/^(.)/, (m, c) => c.toUpperCase())
        .replace(/_(.)/g, (m, c) => c.toUpperCase())
    }
    // Make sure that 'controller' is attached to the name.
    if(!/Controller$/.test(cName)) {
      cName += 'Controller'
      cPath += '_controller'
    }
    cPath += '.js'

    console.log(`Generating "${cName}" => "${cPath}"`)

    // Save the file.
    let source = fs.readFileSync(`${__dirname}/../src/action_controller/template.js`, 'utf8')
    let template = hbs.compile(source)
    fs.writeFileSync(cPath, template({ cName }))

    console.log('Done!')
  })
  .parse(process.argv)
