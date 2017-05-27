const useragent = require('useragent')

const { logger } = require('../../src')

const config = require(`${process.cwd()}/config/application`)

module.exports = (req, res, next) => {
  let replacer = (key, val) => config.filterParameters.includes(key) ? '[FILTERED]' : val
  let params = { params: req.params, body: req.body, query: req.query }
  let paramString = JSON.stringify(params, replacer)

  logger.log([
    `${req.method} - ${req.originalUrl} ${req.protocol.toUpperCase()}`,
    `${new Date().toUTCString()}`,
    `Agent: ${useragent.parse(req.headers['user-agent']).toString()}`,
    `Params: ${paramString}`
  ])

  next()
}
