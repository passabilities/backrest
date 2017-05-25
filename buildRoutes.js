const { Router } = require('express')
const _ = require('lodash')
const glob = require('glob')

const router = Router()
const routes = require(`${process.cwd()}/config/routes`)
// const { before, enableCORS } = require('./middleware')

// router.use(enableCORS)

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

  // let args = [`/${path}`, before]
  let args = [`/${path}`]
  _.each(controller.before, ([methods, fn]) => {
    _.each(methods.split(','), a => {
      if(a === '*' || a === action)
        args.push(fn)
    })
  })
  args.push(controller[action])
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
