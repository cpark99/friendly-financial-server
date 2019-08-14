// const UsersService = require('../src/users/users-service')
// const knex = require('knex')

// describe(`Users service object`, function() {
//   let db
//   let testUsers = [
//     {
//       id: 1,
//       email: 'test@tester.com',
//       password: 'a123',
//       date_created: new Date('2029-01-22T16:28:32.615Z'),
//       date_modified: null
//     },
//     {
//       id: 2,
//       email: 'test2@tester.com',
//       password: 'a1234',
//       date_created: new Date('2029-01-22T16:28:32.615Z'),
//       date_modified: null
//     }
//   ]

//   before(() => {
//     db = knex({
//       client: 'pg',
//       connection: process.env.TEST_DB_URL,
//     })
//   })

//   before(() => db('ff_users').truncate())

//   afterEach(() => db('ff_users').truncate())

//   after(() => db.destroy())

//   context(`Given 'ff_users' has data`, () => {
//     beforeEach(() => {
//       return db
//         .into('ff_users')
//         .insert(testUsers)
//     })

//     it(`getAllUsers() resolves all users from 'ff_users' table`, () => {
//       // test that UsersService.getAllUsers gets data from table
//       return UsersService.getAllUsers(db)
//         .then(actual => {
//           expect(actual).to.eql(testUsers)
//         })
//     })

//     it(`getById() resolves an user by id from 'ff_users' table`, () => {
//       const secondId = 2
//       const secondTestUser = testUsers[secondId - 1]
//       return UsersService.getById(db, secondId)
//         .then(actual => {
//           expect(actual).to.eql({
//             id: secondId,
//             email: secondTestUser.email,
//             password: secondTestUser.password,
//             date_created: secondTestUser.date_created,
//             date_modified: secondTestUser.date_modified
//           })
//         })
//     })

//     it(`deleteUser() removes a user by id from 'ff_users' table`, () => {
//       const userId = 2
//       return UsersService.deleteUser(db, userId)
//         .then(() => UsersService.getAllUsers(db))
//         .then(allUsers => {
//           // copy the test users array without the "deleted" user
//           const expected = testUsers.filter(user => user.id !== userId)
//           expect(allUsers).to.eql(expected)
//         })
//     })

//     it(`updateUser() updates a user from the 'ff_users' table`, () => {
//       const idOfUserToUpdate = 2
//       const secondTestUser = testUsers[idOfUserToUpdate - 1]
//       const newUserData = {
//         email: 'updated email',
//         password: 'updated password',
//         date_created: secondTestUser.date_created,
//         date_modified: new Date()
//       }
//       return UsersService.updateUser(db, idOfUserToUpdate, newUserData)
//         .then(() => UsersService.getById(db, idOfUserToUpdate))
//         .then(user => {
//           expect(user).to.eql({
//             id: idOfUserToUpdate,
//             ...newUserData,
//           })
//         })
//     })
//   })

//   context(`Given 'ff_users' has no data`, () => {
//     it(`getAllUsers() resolves an empty array`, () => {
//       return UsersService.getAllUsers(db)
//         .then(actual => {
//           expect(actual).to.eql([])
//         })
//     })

//     it(`insertUser() inserts a new user and resolves the new user with an 'id'`, () => {
//       const newUser = {
//         email: 'test3@tester.com',
//         password: 'a12345',
//         date_created: new Date('2020-01-01T00:00:00.000Z')
//       }
//       return UsersService.insertUser(db, newUser)
//         .then(actual => {
//           expect(actual).to.eql({
//             id: 1,
//             email: newUser.email,
//             password: newUser.password,
//             date_created: newUser.date_created,
//             date_modified: null
//           })
//         })
//     })
//   })
// })