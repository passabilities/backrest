const { Router } = require('express')
const _ = require('lodash')
const path = require('path')
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
  let name = path.basename(file, '.js')
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
    let jsonProxy = res.json.bind(res)
    res.json = body => {
      for(a of getFilter('after', controller, action)) {
        try {
          let response = a(req, body)
          body = response || body
        } catch(err) {
          jsonProxy({
            'Error': err.mess
          })
        }
      }
      jsonProxy(body)
    }

    let mainAction = controller[action].bind(controller)
    if(mainAction) {
      mainAction(req, res)
    } else {
      jsonProxy('Not a valid action.')
    }
  })
  r[method].apply(r, args)
}
let buildRoutes = (routes, router, root) => {
  _.each(routes, (val, key) => {
    let [ controller, action ] = val
    if(Array.isArray(action)) {
      root = root || controller

      let r = Router({mergeParams: true})
      buildRoutes(action, r, root)

      router.use(`/${controller}`, r)
    } else {
      buildRoute(router, controller, action, root)
    }
  })
}
buildRoutes(routes, router)

module.exports = router

function getFilter(type, controller, action) {
  let filters = filter(type, controller, action)

  type = `skip${type[0].toUpperCase() + type.slice(1)}`
  let skipFilters = filter(type, controller, action)

  filters = _.filter(filters, f => {
    for(let { action } of skipFilters)
      if(action === f.action)
        return false

    return true
  })

  return _.map(filters, f => {
    let a = f.action
    return typeof a === 'string' ? controller[a] : a
  })
}

function filter(type, controller, action) {
  return _.filter(controller[`__${type}Filters`], filter => {
    if(!('action' in filter) || !filter.action)
      throw new Error(`No action defined in filter for [${controller.constructor.name}.${type}: ${JSON.stringify(filter)}].`)

    let found = [],
        options = [ ['only',true], ['except',false] ]

    for(let [ option ] of options)
      found.push(option in filter)
    if(_.every(found, f => f === true))
      throw new Error(`${type[0].toUpperCase() + type.slice(1)} filter cannot have both \'only\' and \'except\' keys.`)

    for(let [ option, use ] of options) {
      if(option in filter) {
        let actions, a
        typeof (actions = filter[option]) === 'string' ? [actions] : actions

        for(a of actions)
          if(a === action)
            return use
        return !use
      }
    }

    return true
  })
}
