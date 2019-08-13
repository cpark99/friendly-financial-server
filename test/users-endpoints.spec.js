const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

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

  context('Given there are users in the database', () => {
    const testUsers = [
      {
        id: 1,
        date_created: '2029-01-22T16:28:32.615Z',
        email: 'test@tester.com',
        password: 'password',
      },
      {
        id: 2,
        date_created: '2029-01-22T16:28:32.615Z',
        email: 'test2@tester.com',
        password: 'password',
      },
      {
        id: 3,
        date_created: '2029-01-22T16:28:32.615Z',
        email: 'test3@tester.com',
        password: 'password',
      },
      {
        id: 4,
        date_created: '2029-01-22T16:28:32.615Z',
        email: 'test4@tester.com',
        password: 'password',
      },
    ];
    
    beforeEach('insert users', () => {
      return db
        .into('ff_users')
        .insert(testUsers)
    })

    it('GET /users responds with 200 and all of the users', () => {
      return supertest(app)
        .get('/users')
        .expect(200)
        // TODO: add more assertions about the body
    })
  })

})