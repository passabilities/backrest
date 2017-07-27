class Base {

  constructor() {
    this.__beforeFilters = []
    this.__skipBeforeFilters = []
    this.__afterFilters = []
    this.__skipAfterFilters = []
  }

  beforeFilter(filter) { this.beforeFilters([filter]) }
  beforeFilters(filters) { this.__beforeFilters.push(...filters) }

  skipBeforeFilter(filter) { this.skipBeforeFilters([filter]) }
  skipBeforeFilters(filters) { this.__skipBeforeFilters.push(...filters) }

  afterFilter(filter) { this.afterFilters([filter]) }
  afterFilters(filters) { this.__afterFilters.push(...filters) }

  skipAfterFilter(filter) { this.beforeFilters([filter]) }
  skipAfterFilters(filters) { this.__skipAfterFilters.push(...filters) }

}

module.exports = Base
