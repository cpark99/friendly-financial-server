require('dotenv').config()
const knex = require('knex')
const UsersService = require('./users-service')
// const ProfilesService = require('./profiles-service')

const knexInstance = knex({
  client: 'pg',
  connection: process.env.DB_URL,
})

console.log(UsersService.getAllUsers())
// console.log(ProfilesService.getAllProfiles())