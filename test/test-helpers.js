const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test@tester.com',
      password: 'password'
    },
    {
      id: 2,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test2@tester.com',
      password: 'password'
    },
    {
      id: 3,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test3@tester.com',
      password: 'password'
    },
    {
      id: 4,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test4@tester.com',
      password: 'password'
    },
  ]
}

function makeProfilesArray(users) {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester',
      email: users[0].email,
      phone: '(888)888-8888',
      life_insurance_goal: '',
      get_email: true,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 2,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester2',
      email: users[1].email,
      phone: '(888)888-8889',
      life_insurance_goal: '',
      get_email: true,
      get_call: true,
      get_newsletter: false
    },
    {
      id: 3,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester3',
      email: users[2].email,
      phone: '(888)888-8887',
      life_insurance_goal: '',
      get_email: false,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 4,
      date_created: '2029-01-22T16:28:32.615Z',
      date_modified: '2029-01-22T16:28:32.615Z',
      name: 'tester4',
      email: users[3].email,
      phone: '(888)888-8886',
      life_insurance_goal: '',
      get_email: true,
      get_call: false,
      get_newsletter: true
    },
  ]
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.into('ff_users').insert(preppedUsers)
    .then(() => {
      db.raw(
        `SELECT setval('ff_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    });
}

function makeExpectedProfile(users, profile) {
  const user = users
    .find(user => user.email === profile.email)

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    life_insurance_goal: profile.life_insurance_goal,
    get_email: profile.get_email,
    get_call: profile.get_call,
    get_newsletter: profile.get_newsletter,
    date_created: profile.date_created,
    date_modified: profile.date_modified,
    // user: {
    //   id: user.id,
    //   email: user.email,
    //   date_created: user.date_created,
    // },
  }
}

function makeMaliciousProfile(user) {
  const maliciousProfile = {
    id: 911,
    date_created: new Date().toISOString(),
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    email: user.email,
    phone: '9999999999',
    life_insurance_goal: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    get_email: true,
    get_call: true,
    get_newsletter: true
  }
  const expectedProfile = {
    ...makeExpectedProfile([user], maliciousProfile),
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    life_insurance_goal: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousProfile,
    expectedProfile,
  }
}

function makeAuthHeader(user) {
  const token = Buffer.from(`${user.email}:${user.password}`).toString('base64')
  return `Basic ${token}`
}

// function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
//   const token = jwt.sign({ email: user.email }, secret, {
//         subject: user.email,
//         algorithm: 'HS256',
//       })
//       return `bearer ${token}`
// }

function makeProfilesFixtures() {
  const testUsers = makeUsersArray()
  const testProfiles = makeProfilesArray(testUsers)
  return { testUsers, testProfiles }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      ff_profiles,
      ff_users
      RESTART IDENTITY CASCADE`
  )
}

function seedProfilesTables(db, users, profiles) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('ff_profiles').insert(profiles);
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('ff_profiles_id_seq', ?)`,
      [profiles[profiles.length - 1].id],
    ) 
  })
}

function seedMaliciousProfile(db, user, profile) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('ff_profiles')
        .insert([profile])
    )
}

module.exports = {
  makeUsersArray,
  makeProfilesArray,
  makeExpectedProfile,
  makeMaliciousProfile,
  makeAuthHeader,
  makeProfilesFixtures,
  cleanTables,
  seedProfilesTables,
  seedMaliciousProfile,
  seedUsers,
}
