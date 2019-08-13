const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray } = require('./users.fixtures')

describe.only('Users Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('ff_users').truncate())

  afterEach('cleanup', () => db('ff_users').truncate())

  describe(`GET /users`, () => {
    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()
      
      beforeEach('insert users', () => {
        return db
          .into('ff_users')
          .insert(testUsers)
      })
  
      it('GET /users responds with 200 and all of the users', () => {
        return supertest(app)
          .get('/users')
          .expect(200, testUsers)
      })
    })
  })
  
  describe(`GET /users/:user_id`, () => {
    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()
      
      beforeEach('insert users', () => {
        return db
          .into('ff_users')
          .insert(testUsers)
      })
  
      it('GET /users/:user_id responds with 200 and the specified article', () => {
        const userId = 2
        const expectedUser = testUsers[userId - 1]
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(200, expectedUser)
      })
    })
  })
})