const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Profiles Endpoints', function() {
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

  describe(`GET /api/profiles`, () => {
    context(`Given no Profiles`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/profiles')
          .expect(200, [])
      })
    })

    context('Given there are Profiles in the database', () => {
      beforeEach('insert Profiles', () =>
        helpers.seedProfilesTables(
          db,
          testUsers,
          testProfiles,
        )
      )

      it('responds with 200 and all of the Profiles', () => {
        const expectedProfiles = testProfiles.map(profile =>
          helpers.makeExpectedProfile(
            testUsers,
            profile,
          )
        )
        return supertest(app)
          .get('/api/profiles')
          .set('Authorization',helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedProfiles)
      })
    })

    context(`Given an XSS attack profile`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousProfile,
        expectedProfile,
      } = helpers.makeMaliciousProfile(testUser)

      beforeEach('insert malicious profile', () => {
        return helpers.seedMaliciousProfile(
          db,
          testUser,
          maliciousProfile,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/profiles`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedProfile.name)
            expect(res.body[0].life_insurance_goal).to.eql(expectedProfile.life_insurance_goal)
          })
      })
    })
  })

  describe(`GET /api/profiles/:profile_id`, () => {
    context(`Given no profiles`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers))

      it(`responds with 404`, () => {
        const profileId = 123456
        return supertest(app)
          .get(`/api/profiles/${profileId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `profile doesn't exist` })
      })
    })

    context('Given there are profiles in the database', () => {
      beforeEach('insert profiles', () =>
        helpers.seedProfilesTables(
          db,
          testUsers,
          testProfiles,
        )
      )

      it('responds with 200 and the specified profile', () => {
        const profileId = 2
        const expectedProfile = helpers.makeExpectedProfile(
          testUsers,
          testProfiles[profileId - 1],
        )

        return supertest(app)
          .get(`/api/profiles/${profileId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedProfile)
      })
    })

    context(`Given an XSS attack profile`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousProfile,
        expectedProfile,
      } = helpers.makeMaliciousProfile(testUser)

      beforeEach('insert malicious profile', () => {
        return helpers.seedMaliciousProfile(
          db,
          testUser,
          maliciousProfile,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/profiles/${maliciousProfile.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedProfile.name)
            expect(res.body.life_insurance_goal).to.eql(expectedProfile.life_insurance_goal)
          })
      })
    })
  })
})


// const { expect } = require('chai')
// const knex = require('knex')
// const app = require('../src/app')
// const { makeProfilesArray, makeMaliciousProfile } = require('./profiles.fixtures')
// const { makeUsersArray } = require('./users.fixtures')

// describe('Profiles Endpoints', function() {
//   let db

//   before('make knex instance', () => {
//     db = knex({
//       client: 'pg',
//       connection: process.env.TEST_DB_URL,
//     })
//     app.set('db', db)
//   })

//   after('disconnect from db', () => db.destroy())

//   before('clean the table', () => db.raw('TRUNCATE ff_profiles, ff_users RESTART IDENTITY CASCADE'))

//   afterEach('cleanup', () => db.raw('TRUNCATE ff_profiles, ff_users RESTART IDENTITY CASCADE'))

//   describe(`GET /api/profiles`, () => {
//     context(`Given no profiles`, () => {
//       it(`responds with 200 and an empty list`, () => {
//         return supertest(app)
//           .get('/api/profiles')
//           .expect(200, [])
//       })
//     })

//     context('Given there are profiles in the database', () => {
//       const testUsers = makeUsersArray();
//       const testProfiles = makeProfilesArray()
      
//       beforeEach('insert profiles', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//           .then(() => {
//             return db
//               .into('ff_profiles')
//               .insert(testProfiles)
//           })
//       })
  
//       it('GET /api/profiles responds with 200 and all of the profiles', () => {
//         return supertest(app)
//           .get('/api/profiles')
//           .expect(200, testProfiles)
//       })
//     })

//     context(`Given an XSS attack profile`, () => {
//       const testUsers = makeUsersArray();
//       const { maliciousProfile, expectedProfile } = makeMaliciousProfile()

//       beforeEach('insert malicious profile', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//           .then(() => {
//             return db
//               .into('ff_profiles')
//               .insert([ maliciousProfile ])
//           }) 
//       })

//       it('removes XSS attack content', () => {
//         return supertest(app)
//           .get(`/api/profiles`)
//           .expect(200)
//           .expect(res => {
//             expect(res.body[0].name).to.eql(expectedProfile.name)
//             expect(res.body[0].email).to.eql(expectedProfile.email)
//             expect(res.body[0].phone).to.eql(expectedProfile.phone)
//           })
//       })
//     })
//   })

//   describe(`GET /api/profiles/:profile_id`, () => {
//     context(`Given no profiles`, () => {
//       it(`responds with 404`, () => {
//         const profileId = 123456
//         return supertest(app)
//           .get(`/api/profiles/${profileId}`)
//           .expect(404, { error: { message: `Profile doesn't exist` } })
//       })
//     })

//     context('Given there are profiles in the database', () => {
//       const testUsers = makeUsersArray();
//       const testProfiles = makeProfilesArray()
      
//       beforeEach('insert profiles', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//           .then(() => {
//             return db
//               .into('ff_profiles')
//               .insert(testProfiles)
//           })
//       })

//       it('GET /api/profiles/:profile_id responds with 200 and the specified profile', () => {
//         const profileId = 2
//         const expectedProfile = testProfiles[profileId - 1]
//         return supertest(app)
//           .get(`/api/profiles/${profileId}`)
//           .expect(200, expectedProfile)
//       })
//     })

//     context(`Given an XSS attack profile`, () => {
//       const testUsers = makeUsersArray();
//       const { maliciousProfile, expectedProfile } = makeMaliciousProfile()
      
//       beforeEach('insert malicious profile', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//           .then(() => {
//             return db
//               .into('ff_profiles')
//               .insert([ maliciousProfile ])
//           })  
//       })
      
//       it('removes XSS attack content', () => {
//         return supertest(app)
//           .get(`/api/profiles/${maliciousProfile.id}`)
//           .expect(200)
//           .expect(res => {
//             expect(res.body.name).to.eql(expectedProfile.name)
//             expect(res.body.email).to.eql(expectedProfile.email)
//             expect(res.body.phone).to.eql(expectedProfile.phone)
//             expect(res.body.get_email).to.eql(expectedProfile.get_email)
//             expect(res.body.get_call).to.eql(expectedProfile.get_call)
//             expect(res.body.get_newsletter).to.eql(expectedProfile.get_newsletter)
//           })
//       })
//     })
//   })

//   describe(`POST /api/profiles`, () => {
//     const testUsers = makeUsersArray();
//     beforeEach('insert malicious profile', () => {
//       return db
//         .into('ff_users')
//         .insert(testUsers) 
//     })

//     it(`creates an profile, responding with 201 and the new profile`, function() {
//       this.retries(3)
//       const newProfile = {
//         name: 'Test new profiles',
//         email: 'email',
//         phone: 'phone',
//         life_insurance_goal: '',
//         get_email: true,
//         get_call: true,
//         get_newsletter: true
//       }
      
//       return supertest(app)
//         .post('/api/profiles')
//         .send(newProfile)
//         .expect(201)
//         .expect(res => {
//           expect(res.body.name).to.eql(newProfile.name)
//           expect(res.body.email).to.eql(newProfile.email)
//           expect(res.body.phone).to.eql(newProfile.phone)
//           expect(res.body.life_insurance_goal).to.eql(newProfile.life_insurance_goal)
//           expect(res.body.get_email).to.eql(newProfile.get_email)
//           expect(res.body.get_call).to.eql(newProfile.get_call)
//           expect(res.body.get_newsletter).to.eql(newProfile.get_newsletter)
//           expect(res.body).to.have.property('id')
//           expect(res.headers.location).to.eql(`/api/profiles/${res.body.id}`)
//           const expected = new Date().toLocaleString()
//           const actual = new Date(res.body.date_created).toLocaleString()
//           expect(actual).to.eql(expected)
//         })
//         .then(postRes =>
//           supertest(app)
//             .get(`/api/profiles/${postRes.body.id}`)
//             .expect(postRes.body)
//         )
//     })
  
//     const requiredFields = ['name', 'email', 'phone', 'life_insurance_goal', 'get_email', 'get_call', 'get_newsletter']
    
//     requiredFields.forEach(field => {
//       const newProfile = {
//         name: 'Test new profiles',
//         email: 'email',
//         phone: 'phone',
//         life_insurance_goal: '$5000000',
//         get_email: true,
//         get_call: true,
//         get_newsletter: true
//       }

//       it(`responds with 400 and an error message when the '${field}' is missing`, () => {
//         delete newProfile[field]

//         return supertest(app)
//           .post('/api/profiles')
//           .send(newProfile)
//           .expect(400, {
//             error: { message: `Missing '${field}' in request body` }
//           })
//       })
//     })

//     it('removes XSS attack content from response', () => {
//       const { maliciousProfile, expectedProfile } = makeMaliciousProfile()
//       return supertest(app)
//         .post(`/api/profiles`)
//         .send(maliciousProfile)
//         .expect(201)
//         .expect(res => {
//           expect(res.body.name).to.eql(expectedProfile.name)
//           expect(res.body.email).to.eql(expectedProfile.email)
//           expect(res.body.phone).to.eql(expectedProfile.phone)
//           expect(res.body.life_insurance_goal).to.eql(expectedProfile.life_insurance_goal)
//           expect(res.body.get_email).to.eql(expectedProfile.get_email)
//           expect(res.body.get_call).to.eql(expectedProfile.get_call)
//           expect(res.body.get_newsletter).to.eql(expectedProfile.get_newsletter)
//         })
//     })
//   })

//   describe(`DELETE /api/profiles/:profile_id`, () => {
//     context(`Given no profiles`, () => {
//       it(`responds with 404`, () => {
//         const profileId = 123456
//         return supertest(app)
//           .delete(`/api/profiles/${profileId}`)
//           .expect(404, { error: { message: `Profile doesn't exist` } })
//       })
//     })

//     context('Given there are profiles in the database', () => {
//       const testUsers = makeUsersArray();
//       const testProfiles = makeProfilesArray()
    
//       beforeEach('insert profiles', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//           .then(() => {
//             return db
//               .into('ff_profiles')
//               .insert(testProfiles)
//           })
//       })
      
//       it('responds with 204 and removes the profile', () => {
//         const idToRemove = 2
//         const expectedProfiles = testProfiles.filter(profile => profile.id !== idToRemove)
//         return supertest(app)
//           .delete(`/api/profiles/${idToRemove}`)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/profiles`)
//               .expect(expectedProfiles)
//          )
//       })
//     })
//   })

//   describe(`PATCH /api/profiles/:profile_id`, () => {
//     context(`Given no profiles`, () => {
//       it(`responds with 404`, () => {
//         const profileId = 123456
//         return supertest(app)
//           .patch(`/api/profiles/${profileId}`)
//           .expect(404, { error: { message: `Profile doesn't exist` } })
//       })
//     })

//     context('Given there are profiles in the database', () => {
//       const testUsers = makeUsersArray();
//       const testProfiles = makeProfilesArray()
      
//       beforeEach('insert profiles', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//           .then(() => {
//             return db
//               .into('ff_profiles')
//               .insert(testProfiles)
//           })
//       })
      
//       it('responds with 204 and updates the profile', () => {
//         const idToUpdate = 2
//         const updateProfile = {
//           name: 'updated user name',
//           email: 'updated@email.com',
//           life_insurance_goal: '$1000000',
//           get_newsletter: true,
//           date_modified: new Date().toISOString(),
//         }
//         const expectedProfile = {
//           ...testProfiles[idToUpdate - 1],
//           ...updateProfile
//         }
//         return supertest(app)
//           .patch(`/api/profiles/${idToUpdate}`)
//           .send(updateProfile)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/profiles/${idToUpdate}`)
//               .expect(expectedProfile)
//           )
//       })

//       it(`responds with 400 when no required fields supplied`, () => {
//         const idToUpdate = 2
//         return supertest(app)
//           .patch(`/api/profiles/${idToUpdate}`)
//           .send({ irrelevantField: 'foo' })
//           .expect(400, {
//             error: {
//               message: `Request body must contain either 'name', 'email', 'phone', 'life_insurance_goal', 'get_email', 'get_call', 'get_newsletter', or 'date_modified'`
//             }
//           })
//       })

//       it(`responds with 204 when updating only a subset of fields`, () => {
//         const idToUpdate = 2
//         const updateProfile = {
//           name: 'updated profile name',
//         }
//         const expectedProfile = {
//           ...testProfiles[idToUpdate - 1],
//           ...updateProfile
//         }
      
//         return supertest(app)
//           .patch(`/api/profiles/${idToUpdate}`)
//           .send({
//             ...updateProfile,
//             fieldToIgnore: 'should not be in GET response'
//           })
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/profiles/${idToUpdate}`)
//               .expect(expectedProfile)
//           )
//       })
//     })
//   })
// })
