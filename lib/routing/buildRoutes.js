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

  let args = [`/${path}`, numParser, logger]
  _.each(controller.before, (filter) => {
    if(!('action' in filter))
      throw new Error('No action defined in before filter.')
    if('only' in filter && 'except' in filter)
      throw new Error('Before filter cannot have both \'only\' and \'except\' keys.')

    let getActions = arr => {
      if(typeof arr === 'string') return [arr]
      else if(arr instanceof Array) return arr
    }
    if('only' in filter) { // Set filter for ONLY these actions
      _.each(getActions(filter.only), a => {
        if(a === action) args.push(filter.action)
      })
    } else if('except' in filter) { // Set filter for all actions EXCEPT these
      _.each(getActions(filter.except), a => {
        if(a !== action) args.push(filter.action)
      })
    } else { // Set filter for every action
      args.push(filter.action)
    }
  })
  args.push(controller[action] ? controller[action] : (req, res) => { res.send('Not a valid action.') })
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
