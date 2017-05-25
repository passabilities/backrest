import _ from 'lodash'
import useragent from 'useragent'

import config from '..'

export const before = (req, res, next) => {
  let replacer = (key, val) => config.filterParameters.includes(key) ? '[FILTERED]' : val
  let params = { params: req.params, body: req.body, query: req.query }
  let paramString = JSON.stringify(params, replacer)

  log([
    `${req.method} - ${req.originalUrl} ${req.protocol.toUpperCase()}`,
    `${new Date().toUTCString()}`,
    `Agent: ${useragent.parse(req.headers['user-agent']).toString()}`,
    `Params: ${paramString}`
  ])

  next()
}

export const enableCORS = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
  next()
}

