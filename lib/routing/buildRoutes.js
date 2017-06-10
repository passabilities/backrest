const { Router } = require('express')
const _ = require('lodash')
const glob = require('glob')
const numParser = require('num-parser')

const router = Router()
const routes = require(`${process.cwd()}/config/routes`)
const {
  logger
} = require('./middleware')

// Define controllers
let controllers = {}
_.each(glob.sync(`${process.cwd()}/app/controllers/*`), file => {
  let name = _.first(_.last(file.split('/')).split('.'))
  let Controller = require(file)
  controllers[name] = new Controller
})

let buildRoute = (r, route, to, root) => {
  if(!/.+ .+/.test(route))
    throw new Error('A method AND path must be specified.')

  let [method, path] = route.split(' ')

  let cName, action
  if(/.+#.+/.test(to))
    [cName, action] = to.split('#')
  else
    [cName, action] = [(root || path.split('/')[0]), to]

  // Controller name must be defined and not be defined as a parameter.
  let controller
  if(!cName || /:.+/.test(cName))
    throw new Error('A controller must be specified.')
  else
    controller = controllers[`${cName}_controller`]

  let args = [`/${path}`, numParser]
  args = args.concat(getFilter('before', controller, action))
  args.push(logger)
  // This calls the main action and after filters
  args.push((req, res) => {
    let sendProxy = res.send.bind(res)
    res.send = body => {
      body = JSON.parse(body)
      _.each(getFilter('after', controller, action), a => {
        let response = a(req, body)
        body = response || body
      })
      sendProxy(JSON.stringify(body))
    }

    let mainAction = controller[action].bind(controller)
    if(mainAction) {
      mainAction(req, res)
    } else {
      sendProxy('Not a valid action.')
    }
  })
  r[method].apply(r, args)
}
let buildRoutes = (routes, router, root) => {
  _.each(routes, (val, key) => {
    if(typeof val === 'object') {
      root = root || key

      let r = Router({mergeParams: true})
      buildRoutes(val, r, root)

      router.use(`/${key}`, r)
    } else {
      buildRoute(router, key, val, root)
    }
  })
}
buildRoutes(routes, router)

module.exports = router

function getFilter(type, controller, action) {
  let filters = _.filter(controller[type], (filter) => {
    if(!('action' in filter))
      throw new Error('No action defined in before filter.')
    if('only' in filter && 'except' in filter)
      throw new Error('Before filter cannot have both \'only\' and \'except\' keys.')

    let add = false

    let getActions = arr => typeof arr === 'string' ? [arr] : arr
    if('only' in filter) { // Set filter for ONLY these actions
      _.each(getActions(filter.only), a => {
        if(add = a === action) return false
      })
    } else if('except' in filter) { // Set filter for all actions EXCEPT these
      _.each(getActions(filter.except), a => {
        if(add = a !== action) return false
      })
    } else { // Set filter for every action
      add = true
    }

    return add
  })
  return _.map(filters, f => f.action.bind(controller))
}
