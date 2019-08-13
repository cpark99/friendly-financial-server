require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require('./config')
const UsersService = require('./users-service')
const ProfilesService = require('./profiles-service')

const app = express();

const morganOption = (NODE_ENV === 'production') ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get('/users', (req,res,next) => {
  const knexInstance = req.app.get('db')
  UsersService.getAllUsers(knexInstance)
    .then(users => {
      res.json(users)
    })
    .catch(next)
})

app.get('/users/:user_id', (req, res, next) => {
  const knexInstance = req.app.get('db')
  UsersService.getById(knexInstance, req.params.user_id)
    .then(user => {
      if (!user) {
        return res.status(404).json({
          error: { message: `User doesn't exist` }
        })
      }
      res.json(user)
    })
    .catch(next)
})

app.get('/profiles', (req,res,next) => {
  const knexInstance = req.app.get('db')
  ProfilesService.getAllProfiles(knexInstance)
    .then(profiles => {
      res.json(profiles)
    })
    .catch(next)
})

app.get('/profiles/:profile_id', (req, res, next) => {
  const knexInstance = req.app.get('db')
  ProfilesService.getById(knexInstance, req.params.profile_id)
    .then(profile => {
      if (!profile) {
        return res.status(404).json({
          error: { message: `Profile doesn't exist` }
        })
      }
      res.json(profile)
    })
    .catch(next)
})

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
