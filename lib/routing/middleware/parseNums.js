const _ = require('lodash')

module.exports = (req, res, next) => {
  req.query = parseNums(req.query)
  req.params = parseNums(req.params)
  req.body = parseNums(req.body)
  next()
}

function parseNums(obj) {
  if(obj instanceof Array) {
    return _.map(obj, parseNums)
  } else if(obj instanceof Object) {
    return _.mapValues(obj, parseNums)
  } else {
    if(typeof obj === 'string' && !isNaN(obj)) {
      return parseFloat(obj)
    } else {
      return obj
    }
  }
}
