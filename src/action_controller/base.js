const _ = require('lodash')

class Base {

  constructor() {
    this.__beforeFilters = []
    this.__skipBeforeFilters = []
    this.__afterFilters = []
    this.__skipAfterFilters = []

    this.beforeFilters([
      { action: '_injectResolve' }
    ])
  }

  beforeFilter(filter) { this.beforeFilters([filter]) }
  beforeFilters(filters) { this.__beforeFilters.push(...filters) }

  skipBeforeFilter(filter) { this.skipBeforeFilters([filter]) }
  skipBeforeFilters(filters) { this.__skipBeforeFilters.push(...filters) }

  afterFilter(filter) { this.afterFilters([filter]) }
  afterFilters(filters) { this.__afterFilters.push(...filters) }

  skipAfterFilter(filter) { this.beforeFilters([filter]) }
  skipAfterFilters(filters) { this.__skipAfterFilters.push(...filters) }

    // Attach a `success` and `error` function to the response object to easily
    // show whether a request was successful or not.
  _injectResolve(req, res, next) {
    let fns = [
      [ 'success', true ],
      [ 'error',   false]
    ]
    _.each(fns, ([ name, success ]) => {
      res[name] = response => {
        // Include any URL parameters that were used in the response.
        res.json(_.extend({}, req.params, {
          success,
          response
        }))
      }
    })
    next()
  }

}

module.exports = Base
