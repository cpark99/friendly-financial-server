const ProfilesService = require('../src/profiles/profiles-service')
const knex = require('knex')

describe(`Profiles service object`, function() {
  let db
  let testProfiles = [
    {
      id: 1,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      date_modified: null,
      name: 'tester',
      email: 'test@tester.com',
      phone: '(888)888-8888',
      life_insurance_goal: '50000',
      get_email: true,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 2,
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      date_modified: null,
      name: 'tester two',
      email: 'test2@tester.com',
      phone: '(888)888-8889',
      life_insurance_goal: '500000',
      get_email: true,
      get_call: true,
      get_newsletter: false
    }
  ]

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
  })

  before(() => db('ff_profiles').truncate())

  afterEach(() => db('ff_profiles').truncate())

  after(() => db.destroy())

  context(`Given 'ff_profiles' has data`, () => {
    beforeEach(() => {
      return db
        .into('ff_profiles')
        .insert(testProfiles)
    })

    it(`getAllProfiles() resolves all profiles from 'ff_profiles' table`, () => {
      // test that ProfilesService.getAllProfiles gets data from table
      return ProfilesService.getAllProfiles(db)
        .then(actual => {
          expect(actual).to.eql(testProfiles)
        })
    })

    it(`getById() resolves a profile by id from 'ff_profiles' table`, () => {
      const secondId = 2
      const secondTestProfile = testProfiles[secondId - 1]
      return ProfilesService.getById(db, secondId)
        .then(actual => {
          expect(actual).to.eql({
            id: secondId,
            name: secondTestProfile.name,
            email: secondTestProfile.email,
            phone: secondTestProfile.phone,
            life_insurance_goal: secondTestProfile.life_insurance_goal,
            get_email: secondTestProfile.get_email,
            get_call: secondTestProfile.get_call,
            get_newsletter: secondTestProfile.get_newsletter,
            date_created: secondTestProfile.date_created,
            date_modified: secondTestProfile.date_modified
          })
        })
    })

    it(`deleteProfile() removes a profile by id from 'ff_profiles' table`, () => {
      const profileId = 2
      return ProfilesService.deleteProfile(db, profileId)
        .then(() => ProfilesService.getAllProfiles(db))
        .then(allProfiles => {
          // copy the test profiles array without the "deleted" profile
          const expected = testProfiles.filter(profile => profile.id !== profileId)
          expect(allProfiles).to.eql(expected)
        })
    })

    it(`updateProfile() updates a profile from the 'ff_profiles' table`, () => {
      const idOfProfileToUpdate = 2
      const secondTestProfile = testProfiles[idOfProfileToUpdate - 1]
      const newProfileData = {
        name: 'updated name',
        email: 'updated email',
        phone: 'updated phone',
        life_insurance_goal: 'updated goal',
        get_email: false,
        get_call: secondTestProfile.get_call,
        get_newsletter: secondTestProfile.get_newsletter,
        date_created: secondTestProfile.date_created,
        date_modified: new Date()
      }
      return ProfilesService.updateProfile(db, idOfProfileToUpdate, newProfileData)
        .then(() => ProfilesService.getById(db, idOfProfileToUpdate))
        .then(profile => {
          expect(profile).to.eql({
            id: idOfProfileToUpdate,
            ...newProfileData,
          })
        })
    })
  })

  context(`Given 'ff_profiles' has no data`, () => {
    it(`getAllProfiles() resolves an empty array`, () => {
      return ProfilesService.getAllProfiles(db)
        .then(actual => {
          expect(actual).to.eql([])
        })
    })

    it(`insertProfile() inserts a new profile and resolves the new profile with an 'id'`, () => {
      const newProfile = {
        name: 'tester three',
        email: 'test3@tester.com',
        phone: '(888)888-8887',
        life_insurance_goal: '1000000',
        get_email: true,
        get_call: true,
        get_newsletter: true,
        date_created: new Date('2020-01-01T00:00:00.000Z')
      }
      return ProfilesService.insertProfile(db, newProfile)
        .then(actual => {
          expect(actual).to.eql({
            id: 1,
            name: newProfile.name,
            email: newProfile.email,
            phone: newProfile.phone,
            life_insurance_goal: newProfile.life_insurance_goal,
            get_email: newProfile.get_email,
            get_call: newProfile.get_call,
            get_newsletter: newProfile.get_newsletter,
            date_created: newProfile.date_created,
            date_modified: null
          })
        })
    })
  })
})