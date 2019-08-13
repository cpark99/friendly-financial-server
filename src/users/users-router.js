const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUser = user => ({
  id: user.id,
  email: xss(user.email),
  password: xss(user.password),
  date_created: user.date_created,
  date_modified: user.date_modified
})

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getAllUsers(knexInstance)
    .then(users => {
      res.json(users.map(serializeUser))
    })      
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { email, password } = req.body
    const newUser = { email, password }

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    UsersService.insertUser(
      req.app.get('db'),
      newUser
    )
      .then(user => {
        res
          .status(201)
          .location(`/users/${user.id}`)
          .json(serializeUser(user))
      })
      .catch(next)
  })

usersRouter
  .route('/:user_id')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getById(knexInstance, req.params.user_id)
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          })
        }
        res.json(serializeUser(user))
      })
      .catch(next)
  })

module.exports = usersRouter