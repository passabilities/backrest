const app = require('express')()
app.use('/', require('../buildRoutes'))
require(`${process.cwd()}/config/boot`)(app)
