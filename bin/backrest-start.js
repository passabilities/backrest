const app = require('express')()
app.use('/', require('../lib/routing/buildRoutes'))
require(`${process.cwd()}/config/boot`)(app)
