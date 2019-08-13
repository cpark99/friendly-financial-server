const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')

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

  context('Given there are profiles in the database', () => {
    const testProfiles = [
      {
        id: 1,
        date_created: '2029-01-22T16:28:32.615Z',
        date_modified: '2029-01-22T16:28:32.615Z',
        name: 'tester',
        email: 'test@tester.com',
        phone: '(888)888-8888',
        life_insurance_goal: '1000000',
        get_email: true,
        get_call: true,
        get_newsletter: true
      },
      {
        id: 2,
        date_created: '2029-01-22T16:28:32.615Z',
        date_modified: '2029-01-22T16:28:32.615Z',
        name: 'tester2',
        email: 'test2@tester.com',
        phone: '(888)888-8889',
        life_insurance_goal: '100000',
        get_email: true,
        get_call: true,
        get_newsletter: false
      },
      {
        id: 3,
        date_created: '2029-01-22T16:28:32.615Z',
        date_modified: '2029-01-22T16:28:32.615Z',
        name: 'tester3',
        email: 'test3@tester.com',
        phone: '(888)888-8887',
        life_insurance_goal: '500000',
        get_email: false,
        get_call: true,
        get_newsletter: true
      },
      {
        id: 4,
        date_created: '2029-01-22T16:28:32.615Z',
        date_modified: '2029-01-22T16:28:32.615Z',
        name: 'tester4',
        email: 'test4@tester.com',
        phone: '(888)888-8886',
        life_insurance_goal: '150000',
        get_email: true,
        get_call: false,
        get_newsletter: true
      },
    ];
    
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

    it('GET /profiles/:profile_id responds with 200 and the specified profile', () => {
      const profileId = 2
      const expectedProfile = testProfiles[profileId - 1]
      return supertest(app)
        .get(`/profiles/${profileId}`)
        .expect(200, expectedProfile)
    })
  })

})