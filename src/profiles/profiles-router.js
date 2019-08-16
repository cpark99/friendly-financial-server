const debug = require('debug');

const path = require('path')
const express = require('express')
const xss = require('xss')
const ProfilesService = require('./profiles-service')
const { requireAuth } = require('../middleware/jwt-auth')

const profilesRouter = express.Router()
const jsonParser = express.json()

const serializeProfile = profile => ({
  id: profile.id,
  name: xss(profile.name),
  email: xss(profile.email),
  phone: xss(profile.phone),
  life_insurance_goal: profile.life_insurance_goal,
  get_email: profile.get_email,
  get_call: profile.get_call,
  get_newsletter: profile.get_newsletter,
  date_created: profile.date_created,
  date_modified: profile.date_modified
})

profilesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ProfilesService.getAllProfiles(knexInstance)
      .then(profiles => {
        res.json(profiles.map(serializeProfile))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, email, phone, life_insurance_goal, get_email, get_call, get_newsletter } = req.body
    const newProfile = { name, email, phone, life_insurance_goal, get_email, get_call, get_newsletter }

    for (const [key, value] of Object.entries(newProfile)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }

    ProfilesService.insertProfile(
      req.app.get('db'),
      newProfile
    )
      .then(profile => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${profile.id}`))
          .json(serializeProfile(profile))
      })
      .catch(next)
  })

profilesRouter
  .route('/:profile_id')
  .all(requireAuth)
  .all((req, res, next) => {
    ProfilesService.getById(
      req.app.get('db'),
      req.params.profile_id
    )
      .then(profile => {
        if (!profile) {
          return res.status(404).json({
            error: `profile doesn't exist` 
          })
        }
        debugger;
        res.profile = profile // save the profile for the next middleware
        next() // don't forget to call next so the next middleware happens!
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeProfile(res.profile))
    console.log(`res.profile: ${res.profile}`)
  })
  .delete((req, res, next) => {
    ProfilesService.deleteProfile(
      req.app.get('db'),
      req.params.profile_id
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name, email, phone, life_insurance_goal, get_email, get_call, get_newsletter, date_modified } = req.body
    const profileToUpdate = { name, email, phone, life_insurance_goal, get_email, get_call, get_newsletter, date_modified }

    const numberOfValues = Object.values(profileToUpdate).filter(Boolean).length
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'name', 'email', 'phone', 'life_insurance_goal', 'get_email', 'get_call', 'get_newsletter', or 'date_modified'`
        }
      })
    }

    ProfilesService.updateProfile(
      req.app.get('db'),
      req.params.profile_id,
      profileToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = profilesRouter