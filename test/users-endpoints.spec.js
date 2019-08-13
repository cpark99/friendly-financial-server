const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures')

describe('Users Endpoints', function() {
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
    context(`Given no users`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/users')
          .expect(200, [])
      })
    })

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

    context(`Given an XSS attack user`, () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser()

      beforeEach('insert malicious user', () => {
        return db
          .into('ff_users')
          .insert([ maliciousUser ])
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/users`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].email).to.eql(expectedUser.email)
            expect(res.body[0].password).to.eql(expectedUser.password)
          })
      })
    })
  })
  
  describe(`GET /users/:user_id`, () => {
    context(`Given no users`, () => {
      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(404, { error: { message: `User doesn't exist` } })
      })
    })

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
  
      it('GET /users/:user_id responds with 200 and the specified article', () => {
        const userId = 2
        const expectedUser = testUsers[userId - 1]
        return supertest(app)
          .get(`/users/${userId}`)
          .expect(200, expectedUser)
      })
    })

    context(`Given an XSS attack user`, () => {
      const maliciousUser = {
        id: 911,
        email: 'Naughty naughty very naughty <script>alert("xss");</script>',
        password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
      }
      
      beforeEach('insert malicious user', () => {
        return db
          .into('ff_users')
          .insert([ maliciousUser ])
      })
      
      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/users/${maliciousUser.id}`)
          .expect(200)
          .expect(res => {
            expect(res.body.email).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
            expect(res.body.password).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
          })
      })
    })
  })

  describe(`POST /users`, () => {
    it(`creates an user, responding with 201 and the new user`, function() {
      this.retries(3)
      const newUser = {
        email: 'Test new user',
        password: 'password'
      }

      return supertest(app)
        .post('/users')
        .send(newUser)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(newUser.email)
          expect(res.body.password).to.eql(newUser.password)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/users/${res.body.id}`)
          const expected = new Date().toLocaleString()
          const actual = new Date(res.body.date_created).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(postRes =>
          supertest(app)
            .get(`/users/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })

    const requiredFields = ['email', 'password']

    requiredFields.forEach(field => {
      const newUser = {
        email: 'tester@tester.com',
        password: 'a123'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newUser[field]

        return supertest(app)
          .post('/users')
          .send(newUser)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

    it('removes XSS attack content from response', () => {
      const { maliciousUser, expectedUser } = makeMaliciousUser()
      return supertest(app)
        .post(`/users`)
        .send(maliciousUser)
        .expect(201)
        .expect(res => {
          expect(res.body.email).to.eql(expectedUser.email)
          expect(res.body.password).to.eql(expectedUser.password)
        })
    })
  })

  describe.only(`DELETE /users/:user_id`, () => {
    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray()
    
      beforeEach('insert users', () => {
        return db
          .into('ff_users')
          .insert(testUsers)
      })
      
      it('responds with 204 and removes the user', () => {
        const idToRemove = 2
        const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
        return supertest(app)
          .delete(`/users/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/users`)
              .expect(expectedUsers)
         )
      })
    })
  })
})