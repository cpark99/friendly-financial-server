const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test@tester.com',
      password: 'password',
      name: 'tester',
      phone: '(888)888-8888',
      life_insurance_goal: '',
      get_email: true,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 2,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test2@tester.com',
      password: 'password',
      name: 'tester2',
      phone: '(888)888-8889',
      life_insurance_goal: '',
      get_email: true,
      get_call: true,
      get_newsletter: false
    },
    {
      id: 3,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test3@tester.com',
      password: 'password',
      name: 'tester3',
      phone: '(888)888-8887',
      life_insurance_goal: '',
      get_email: false,
      get_call: true,
      get_newsletter: true
    },
    {
      id: 4,
      date_created: '2029-01-22T16:28:32.615Z',
      email: 'test4@tester.com',
      password: 'password',
      name: 'tester4',
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
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('ff_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    });
}

function makeExpectedUser(users, profile) {
  const user = users
    .find(user => user.id === profile.id)

  // console.log(user)  

  return {
    id: profile.id,
    date_created: profile.date_created,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    life_insurance_goal: profile.life_insurance_goal,
    get_email: profile.get_email,
    get_call: profile.get_call,
    get_newsletter: profile.get_newsletter
  }
}

function makeMaliciousUser(user) {
  const maliciousUser = {
    id: 911,
    date_created: new Date().toISOString(),
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    password: 'passwordD2@',
    email: 'xss@email.com',
    phone: '9999999999',
    life_insurance_goal: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    get_email: true,
    get_call: true,
    get_newsletter: true
  }
  const expectedUser = {
    ...makeExpectedUser([user], maliciousUser),
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    life_insurance_goal: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousUser,
    expectedUser,
  }
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ email: user.email }, secret, {
    subject: user.email,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

function makeUsersFixtures() {
  const testUsers = makeUsersArray()
  // const testProfiles = makeProfilesArray(testUsers)
  return { testUsers }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      ff_users
      RESTART IDENTITY CASCADE`
  )
}

function seedMaliciousUser(db, profile) {
  return db
    .into('ff_users')
    .insert([profile])
}

module.exports = {
  makeUsersArray,
  makeExpectedUser,
  makeMaliciousUser,
  makeAuthHeader,
  makeUsersFixtures,
  cleanTables,
  seedMaliciousUser,
  seedUsers,
}
