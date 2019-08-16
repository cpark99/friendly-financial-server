const express = require('express')
const path = require('path')
const xss = require('xss')
const jsonBodyParser = express.json()
const jsonParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth')
const UsersService = require('./users-service')
const usersRouter = express.Router()

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
      .then(users => {
        res.json(users.map(UsersService.serializeUser))
      })
      .catch(next)
  })
  .post(jsonBodyParser, (req, res, next) => {
    const { password, email, name, phone, life_insurance_goal, get_email, get_call, get_newsletter } = req.body

    for (const field of ['email', 'password', 'name', 'phone', 'get_email', 'get_call', 'get_newsletter'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`
        })

    const passwordError = UsersService.validatePassword(password)
  
    if (passwordError)
      return res.status(400).json({ error: passwordError })

    UsersService.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail)
          return res.status(400).json({ error: `Email already taken` })

          return UsersService.hashPassword(password)
            .then(hashedPassword => {
              const newUser = {
                email,
                password: hashedPassword,
                name,
                phone,
                life_insurance_goal,
                get_email,
                get_call,
                get_newsletter,
                date_created: 'now()',
              }
          
              return UsersService.insertUser(
                req.app.get('db'),
                newUser
              )
                .then(user => {
                  res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                    .json(UsersService.serializeUser(user))
                })
            })
      })
      .catch(next)
  })

usersRouter
  .route('/:user_id')
  .all(requireAuth)
  .all((req, res, next) => {
    UsersService.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: `user doesn't exist` 
          })
        }
        res.user = user // save the user for the next middleware
        next() // don't forget to call next so the next middleware happens!
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(UsersService.serializeUser(res.user))
    console.log(`res.user: ${res.user}`)
  })
  .delete((req, res, next) => {
    UsersService.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, email, phone, life_insurance_goal, get_email, get_call, get_newsletter, date_modified } = req.body
    const userToUpdate = { name, email, phone, life_insurance_goal, get_email, get_call, get_newsletter, date_modified }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'name', 'email', 'phone', 'life_insurance_goal', 'get_email', 'get_call', 'get_newsletter', or 'date_modified'`
        }
      })
    }

    UsersService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = usersRouter

// const path = require('path')
// const express = require('express')
// const xss = require('xss')
// const UsersService = require('./users-service')
// const usersRouter = express.Router()
// const jsonParser = express.json()

// const serializeUser = user => ({
//   id: user.id,
//   email: xss(user.email),
//   password: xss(user.password),
//   date_created: user.date_created,
//   date_modified: user.date_modified
// })

// usersRouter
//   .route('/')
//   // .get((req, res, next) => {
//   //   const knexInstance = req.app.get('db')
//   //   UsersService.getAllUsers(knexInstance)
//   //   .then(users => {
//   //     res.json(users.map(serializeUser))
//   //   })      
//   //     .catch(next)
//   // })
//   .post(jsonParser, (req, res, next) => {
//     const { email, password } = req.body
//     const newUser = { email, password }

//     for (const [key, value] of Object.entries(newUser)) {
//       if (value == null) {
//         return res.status(400).json({
//           error: { message: `Missing '${key}' in request body` }
//         })
//       }
//     }

//     UsersService.insertUser(
//       req.app.get('db'),
//       newUser
//     )
//       .then(user => {
//         res
//           .status(201)
//           .location(path.posix.join(req.originalUrl, `/${user.id}`))
//           .json(serializeUser(user))
//       })
//       .catch(next)
//   })

// usersRouter
//   .route('/:user_id')
//   .all((req, res, next) => {
//     UsersService.getById(
//       req.app.get('db'),
//       req.params.user_id
//     )
//       .then(user => {
//         if (!user) {
//           return res.status(404).json({
//             error: { message: `User doesn't exist` }
//           })
//         }
//         res.user = user // save the user for the next middleware
//         next() // don't forget to call next so the next middleware happens!
//       })
//       .catch(next)
//   })
//   .get((req, res, next) => {
//     res.json(serializeUser(res.user))
//   })
//   .delete((req, res, next) => {
//     UsersService.deleteUser(
//       req.app.get('db'),
//       req.params.user_id
//     )
//       .then(() => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })
//   .patch(jsonParser, (req, res, next) => {
//     const { email, password, date_modified } = req.body
//     const userToUpdate = { email, password, date_modified }

//     const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
//     if (numberOfValues === 0) {
//       return res.status(400).json({
//         error: {
//           message: `Request body must contain either 'email', 'password', or 'date_modified'`
//         }
//       })
//     }

//     UsersService.updateUser(
//       req.app.get('db'),
//       req.params.user_id,
//       userToUpdate
//     )
//       .then(numRowsAffected => {
//         res.status(204).end()
//       })
//       .catch(next)
//   })

// module.exports = usersRouter