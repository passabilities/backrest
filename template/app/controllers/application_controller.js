class ApplicationController {

  get before() {
    return [
      ['*', this._setHeaders]
    ]
  }

  constructor() {
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
