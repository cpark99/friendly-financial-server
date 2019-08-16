// require('dotenv').config()

// const knex = require('knex')
// const UsersService = require('./users-service')
// const ProfilesService = require('./profiles-service')

// const knexInstance = knex({
//   client: 'pg',
//   connection: process.env.DB_URL,
// })

// // use all the UsersService methods!!
// UsersService.getAllUsers(knexInstance)
//   .then(users => console.log(users))
//   .then(() =>
//     UsersService.insertUser(knexInstance, {
//       email: 'test3@tester.com',
//       password: 'a12345',
//       date_created: new Date('2020-01-01T00:00:00.000Z')
//     })
//   )
//   .then(newUser => {
//     console.log(newUser)
//     return UsersService.updateUser(
//       knexInstance,
//       newUser.id,
//       { title: 'Updated title' }
//     ).then(() => UsersService.getById(knexInstance, newUser.id))
//   })
//   .then(user => {
//     console.log(user)
//     return UsersService.deleteUser(knexInstance, user.id)
//   })

// // use all the UsersService methods!!
// ProfilesService.getAllProfiles(knexInstance)
//   .then(profiles => console.log(profiles))
//   .then(() =>
//     ProfilesService.insertProfile(knexInstance, {
//       name: 'tester three',
//       email: 'test3@tester.com',
//       phone: '(888)888-8887',
//       life_insurance_goal: '1000000',
//       get_email: true,
//       get_call: true,
//       get_newsletter: true,
//       date_created: new Date('2020-01-01T00:00:00.000Z')
//     })
//   )
//   .then(newProfile => {
//     console.log(newProfile)
//     return ProfilesService.updateProfile(
//       knexInstance,
//       newProfile.id,
//       { title: 'Updated title' }
//     ).then(() => ProfilesService.getById(knexInstance, newProfile.id))
//   })
//   .then(profile => {
//     console.log(profile)
//     return ProfilesService.deleteProfile(knexInstance, profile.id)
//   })