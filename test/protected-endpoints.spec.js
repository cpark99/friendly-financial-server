const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe(`Protected endpoints`, () => {
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
      it(`responds with 401 'Missing basic token' when no basic token`, () => {
        return supertest(app)
          .get(endpoint.path)
          .expect(401, { error: `Missing basic token` })
      })

      it(`responds 401 'Unauthorized request' when no credentials in token`, () => {
        const userNoCreds = { email: '', password: '' }
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userNoCreds))
          .expect(401, { error: `Unauthorized request` })
      })

      it(`responds 401 'Unauthorized request' when invalid user`, () => {
        const userInvalidCreds = { email: 'user-not', password: 'existy' }
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
          .expect(401, { error: `Unauthorized request` })
      })

      it(`responds 401 'Unauthorized request' when invalid password`, () => {
        const userInvalidPass = { email: testUsers[0].email, password: 'wrong' }
        return supertest(app)
          .get(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userInvalidPass))
          .expect(401, { error: `Unauthorized request` })
      })
    })
  })
})
