const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe.only(`Protected endpoints`, () => {
  let db

  const {
    testUsers,
    testProfiles,
  } = helpers.makeProfilesFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  beforeEach('insert profiles', () =>
    helpers.seedProfilesTables(
      db,
      testUsers,
      testProfiles,
    )
  )

  const protectedEndpoints = [
    {
      name: 'GET /api/profiles/:profile_id',
      path: '/api/profiles/1'
    },
    // { // (additional endpoint)
    //   name: 'GET /api/profiles/:profile_id/comments',
    //   path: '/api/profiles/1/comments'
    // },
  ]
    
  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it(`responds with 401 'Missing bearer token' when no bearer token`, () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: `Missing bearer token` })
      })

      it(`responds 401 'Unauthorized request' when invalid JWT secret`, () => {
        const validUser = testUsers[0]
        const invalidSecret = 'bad-secret'
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(validUser, invalidSecret))
          .expect(401, { error: `Unauthorized request` })
      })

      it(`responds 401 'Unauthorized request' when invalid sub in payload`, () => {
        const invalidUser = { email: 'user@not-existy', id: 1 }
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { error: `Unauthorized request` })
      })
    })
  })
})
