const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeProfilesArray } = require('./profiles.fixtures')

describe.only('Profiles Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('ff_profiles').truncate())

  afterEach('cleanup', () => db('ff_profiles').truncate())

  describe(`GET /profiles`, () => {
    context('Given there are profiles in the database', () => {
      const testProfiles = makeProfilesArray()
      
      beforeEach('insert profiles', () => {
        return db
          .into('ff_profiles')
          .insert(testProfiles)
      })
  
      it('GET /profiles responds with 200 and all of the profiles', () => {
        return supertest(app)
          .get('/profiles')
          .expect(200, testProfiles)
      })
    })
  })

  describe(`GET /profiles/:profile_id`, () => {
    context('Given there are profiles in the database', () => {
      const testProfiles = makeProfilesArray()
      
      beforeEach('insert profiles', () => {
        return db
          .into('ff_profiles')
          .insert(testProfiles)
      })
  
      it('GET /profiles responds with 200 and all of the profiles', () => {
        return supertest(app)
          .get('/profiles')
          .expect(200, testProfiles)
      })
    })
  })
})