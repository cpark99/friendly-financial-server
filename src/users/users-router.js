const express = require('express')
const path = require('path')
const jsonBodyParser = express.json()
const jsonParser = express.json()
const { requireAuth } = require('../middleware/jwt-auth')
const UsersService = require('./users-service')
const usersRouter = express.Router()

usersRouter
  .route('/')
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
  })
  .patch(jsonParser, (req, res, next) => {
    const { life_insurance_goal } = req.body
    const userToUpdate = { life_insurance_goal }

    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain 'life_insurance_goal'`
        }
      })

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
