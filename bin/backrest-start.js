// Set default environment to 'development'
global.__ENV__ = process.env.NODE_ENV || 'development'
global.__DEV__ = __ENV__ === 'development'

const app = require('express')()
app.use('/', require('../lib/routing/buildRoutes'))
require(`${process.cwd()}/config/boot`)(app)
