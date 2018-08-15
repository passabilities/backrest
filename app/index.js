const _ = require('lodash')
const glob = require('glob')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const config = require(`${process.cwd()}/config/application`)

// Set default environment to 'development'
global.__ENV__ = process.env.NODE_ENV || 'development'
global.__DEV__ = __ENV__ === 'development'

const app = require('express')()

// Evaluate initializer files before starting the server.
_.each(glob.sync(`${process.cwd()}/config/initializers/*`), require)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser(config.cookieSecret))
app.use('/', require('../lib/routing/buildRoutes'))

module.exports = app
