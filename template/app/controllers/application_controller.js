const {
  ActionController
} = require('backrest')

class ApplicationController extends ActionController.Base {

  constructor() {
    super()

    this.beforeFilters([
      { action: this._setHeaders }
    ])
  }

  _setHeaders(req, res, next) {
    // Example headers
    // res.header("Access-Control-Allow-Origin", "*")
    // res.header("Access-Control-Allow-Methods", "OPTIONS,GET,HEAD,POST,PUT,DELETE")
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
    next()
  }

}

module.exports = ApplicationController
