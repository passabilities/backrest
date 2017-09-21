# Backrest [![npm](https://img.shields.io/npm/v/backrest.svg)](https://www.npmjs.com/package/backrest)

Rails like Node framework to create simple, pure backend APIs.

## CLI

### Install

`npm i backrest -g`

### Usage

```
 ❯ backrest help

  Usage: backrest [options] [command]


  Commands:

    init|i <name>  create blank Backrest template
    start|s        start the server
    stop           stop the server
    help [cmd]     display help for [cmd]

  Options:

    -h, --help  output usage information
```

### Development

Start the project and watch for file changes.

`backrest s -w`

### Production

Start the project in a background process.

`NODE_ENV=production backrest s -d`

To stop:

`backrest stop`

## Package Module

This project uses [ExpressJS](http://expressjs.com/) behind the scenes. Please visit their website to have a better understanding of how routing and requests work.

### Routing

Creating routes are meant to be easy with a very simple structure.
They are defined using an array format to allow defining route precedence.
Former routes will take precedence over latter ones if they both match the requested URL.

Location: `config/routes.js`

Each route will need a couple things:

* An action verb
* URL end point
* Controller name
* Action name

The layout of each route will be in the following format:

```
['{verb} {url}', '({controller}#){action}' || [{subroutes}]]
```

* **verb**
  * `get`, `post`, `patch`, `put`, or `delete`
* **url**
  * URL end point that begins at root (leading `/` is optional)
  * URLs are allowed to have parameters defined denoted using a colon (`:`)
    * Example: `users/:id`
* **controller** (optional)
  * The controller name is the prefix of the file it is defined in. e.g. `users` for `app/controllers/users_controller.js`
  * May be omitted to set the controller name to the first part of the route **url**. e.g. `users` for `['get users/all', 'getAll']`
* **action**
  * This is the name of the method to call defined in the controller.
* **subroutes**
  * Subroutes may be defined instead of a controller and action.

There are a couple ways to define how routes work:

1. Inline:

  ```javascript
    module.exports = [
      ['get users/all', 'users#getAll']
    ]
  ```

1. With subroutes:

  ```javascript
    module.exports = [
      ['users', [
        ['get all', 'users#getAll']
      ]]
    ]
  ```

1. Exclude controller name:

  If the root of the URL is the same as the controller name, you may exclude it in the route definition. Both of the following point to the `users` controller:
  ```javascript
    module.exports = [
      ['get users/all', 'getAll'],
      ['users', [
        ['get all', 'getAll']
      ]]
    ]
  ```

1. [With `resources` verb](#resources):

  ```javascript
    module.exports = [
      ['resources users']
    ]
  ```

#### Resources

Auto generate resource routes with the `['resources {name}']` route format.

The **name** of the resource must be a single word.

The following routes will be generated:

```javascript
  [{name}, [
    [`get /`,       'fetchAll'],
    [`get /:id`,    'fetch'],
    [`post /`,      'create'],
    [`patch /:id`,  'update'],
    [`put /:id`,    'replace'],
    [`delete /:id`, 'destroy']
  ]]
```

### Controllers

Controllers are used to define the actions to take place on each request.

They should be saved to the `app/controllers/` directory with the suffix `_controller.js` attached. For example `app/controllers/users_controller.js`

#### Actions

Each action function will have 2 arguments. `req` and `res` standing for `request` and `response` respectfully.

```javascript
  getAll(req, res) {

  }
```

#### Before Filters

Each before filter function will have 3 arguments: `req`, `res`, and `next`

Before filters can do perform the following tasks:
  * Execute any code.
  * Make changes to the request and the response objects.
  * End the request-response cycle.
  * Call the next before filter or action function for the request.

##### Definition

Before filters are set in the controller by calling `this.beforeFilter[s]` with object[s] from within the controller `constructor`.
Each object should contain at least 1 property called `action` which is the reference to or string value of the function to be called.
Other properties to be used are `only` OR `except` which tell the router which actions to call the before filters for.
`only` and `except` can be either a string or array of strings denoting the name of the actions.

Filters can also be skipped by calling `this.skipBeforeFilter[s]` with the same rules defined above

Filters are executed in the same order they are defined.

Examples:

```javascript
  constructor() {
    super()

    this.beforeFilters([
      { action: '_checkAdmin', except: ['getPublic'] },
      { action: this._sayHello }
    ])
    this.skipBeforeFilter(
      { action: this._checkAdmin, only: ['getPublic'] }
    )
  }

  _checkAdmin(req, res, next) {
    let user = getUserById(req.params.id)
    if(user.isAdmin)
      next() // Continues to the next filter in the chain.
    else
      res // Otherwise, respond to request with error.
        .status(401)
        .send('User is not admin. Action is prohibited.')
  }

  _sayHello(req, res, next) {
    console.log('Hello!')
    next()
  }
```

### Initializers

Initializers are used to run scripts before the server is started. To create an initializer script, create a file with any name in the directory `config/initializers/`
