const { Router } = require('express')
const _ = require('lodash')
const path = require('path')
const glob = require('glob')
const numParser = require('num-parser')

const mainRouter = Router()
const routes = require(`${process.cwd()}/config/routes`)
const {
  controllerPath
} = require('../constants')
const {
  logger
} = require('./middleware')

// Keep a reference of project controllers.
let controllers = {}
_.each(glob.sync(`${process.cwd()}/${controllerPath}/*`), file => {
  let name = path.basename(file, '.js')
  // Require each controller file and keep reference as its file name.
  let Controller = require(file)
  controllers[name] = new Controller
})

let genResourceRoutes = root => {
  return [
    [root, [
      [`get /`,       'fetchAll'],
      [`get /:id`,    'fetch'],
      [`post /`,      'create'],
      [`patch /:id`,  'update'],
      [`put /:id`,    'replace'],
      [`delete /:id`, 'destroy']
    ]]
  ]
}

let buildRoute = (router, verb, url, to, root) => {
  // Check how action function is referenced.
  let cName, action
  if(/.+#.+/.test(to))
    // If '#' present, it splits the controller name and the action method name.
    [cName, action] = to.split('#')
  else
    // Otherwise, controller name is the root path or first section of the URL as
    // the controller name and `to` as the action method name.
    [cName, action] = [(root || url.split('/')[0]), to]

  // Set controller to be use.
  let controller
  // Controller name must not be null and not be defined as a URL parameter.
  if(!cName || /:.+/.test(cName))
    throw new Error('A controller must be specified.')
  else {
    // Controllers should be defined with '_controller' attached to the end of the file name.
    let fileName = `${cName}_controller`,
        className = fileName.replace(/^[a-z]/, c => c.toUpperCase()).replace(/(_[a-z])/g, s => s.replace('_','').toUpperCase())
    controller = controllers[fileName]
    if(!controller)
      throw new Error(`${className} does not exist for route "${path}".`)
  }

  // Arguments to be passed in route initilizaion function.
  let args = [`/${url.replace(/^(\/)/, '')}`, logger]
  // Add any before filters to the middleware stack.
  args = args.concat(getFilterMethods('before', controller, action))
  // Parse sent variables if they are numbers.
  args.push(numParser)
  // Add the main action method and after filters.
  args.push((req, res) => {
    // Redefine `res.json` to call before filters and proxy call original `res.json`
    // response method.
    let jsonProxy = res.json.bind(res)
    res.json = body => {
      // Allow each after filter to manipulate the reponse in respective order.
      _.each(getFilterMethods('after', controller, action), afterFilter => {
        try {
          let response = afterFilter(req, body)
          body = response || body
        } catch(err) {
          jsonProxy({
            'Error': err.mess
          })
        }
      })
      jsonProxy(body)
    }

    // Check the existance of the action method. Else return error response.
    let mainAction = controller[action]
    if(mainAction) {
      mainAction.call(controller, req, res)
    } else {
      jsonProxy('Action does not exist.').status(404)
    }
  })
  router[verb].apply(router, args)
}
let buildRoutes = (router, routes, root) => {
  // Loop each route defined.
  // NOTE: Routes must be defined in an array for proper initilizaion order.
  _.each(routes, route => {
    let [ path, toAction ] = route

    // If `toAction` is an Array, expect it to be subroutes.
    if(Array.isArray(toAction)) {
      let baseRoot
      if(root) {
        baseRoot = root
      } else {
        if(!/^\w+$/.test(path))
          throw new Error('Routes that contain subroutes must only be described by a single word.')
        baseRoot = path
      }

      // Build subroutes.
      let subRouter = Router({mergeParams: true})
      buildRoutes(subRouter, toAction, baseRoot)

      // Attach subrouter to parent router.
      router.use(`/${path}`, subRouter)
    } else {
      let [ verb, url ] = path.split(' ')

      if(verb === 'resources') {
        if(!/^\w+$/.test(url))
          throw new Error(`Resource routes must only be described by a single word. ("${url}")`)

        // Build all resource routes.
        buildRoutes(router, genResourceRoutes(url), root)
      } else {
        if(!toAction)
          throw new Error(`No action method or subroutes are defined for route "${path}". Please check proper route definitions.`)

        // Build single route.
        buildRoute(router, verb, url, toAction, root)
      }
    }
  })
}
// Initilize routes.
buildRoutes(mainRouter, routes)

module.exports = mainRouter

// Get list of filter methods to be applied to a specific action.
function getFilterMethods(type, controller, action) {
  // Get all filters for the action.
  let filters = getFilters(type, controller, action)
  // Get filter method names to be skipped.
  type = `skip${type[0].toUpperCase() + type.slice(1)}`
  let skipFilterMethods = _.map(getFilters(type, controller, action), 'action')

  // Remove filters that should be skipped.
  filters = _.filter(filters, f => {
    for(let method of skipFilterMethods)
      if(method === f.action)
        return false
    return true
  })

  // Return final list of filter methods.
  return _.map(filters, f => {
    let { action } = f
    action = typeof action === 'string' ? controller[action] : action
    return action.bind(controller)
  })
}

// Get list of filters based on the type name to be applied to a specific action.
function getFilters(type, controller, action) {
  // User can set 'only' and 'except' rules on filters to be used on one
  // or many action methods.
  let useOptions = { only: true, except: false }

  // Only return action filter methods that apply.
  return _.filter(controller[`__${type}Filters`], filter => {
    // An action must be defined in each filter.
    if(!('action' in filter) || !filter.action)
      throw new Error(`No action defined in filter for [${controller.constructor.name}.${type}: ${JSON.stringify(filter)}].`)

    // Filter cannot contain both options.
    let containsBoth = _.every(_.keys(useOptions), o => o in filter)
    if(containsBoth)
      throw new Error(`${type[0].toUpperCase() + type.slice(1)} filter cannot have both \'only\' and \'except\' keys.`)

    let option = _.first(_.intersection(_.keys(useOptions), _.keys(filter)))
    // If no option is defined, use for all actions.
    if(!option)
      return true

    let useActions, use = useOptions[option]
    useActions = typeof (useActions = filter[option]) === 'string' ? [useActions] : useActions
    // Determine if filter can be used for this action.
    for(let ua of useActions)
      if(ua === action)
        return use

    return !use
  })
}
