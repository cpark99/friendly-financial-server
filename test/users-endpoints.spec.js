const knex = require("knex");
const bcrypt = require('bcryptjs')
const app = require("../src/app");
const helpers = require("./test-helpers");

describe.only("Users Endpoints", function() {
  let db;

  const { testUsers } = helpers.makeProfilesFixtures();
  const testUser = testUsers[0];

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => helpers.cleanTables(db));

  afterEach("cleanup", () => helpers.cleanTables(db));

  describe(`POST /api/users`, () => {
    context(`User Validation`, () => {
      beforeEach("insert users", () => helpers.seedUsers(db, testUsers));

      const requiredFields = ["email", "password"];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          email: "test email",
          password: "test password"
        };

        it(`responds with 400 required error when '${field}' is missing`, () => {
          delete registerAttemptBody[field];

          return supertest(app)
            .post("/api/users")
            .send(registerAttemptBody)
            .expect(400, {
              error: `Missing '${field}' in request body`
            });
        });

        it(`responds 400 'Password be longer than 8 characters' when empty password`, () => {
          const userShortPassword = {
            email: "test email",
            password: "1234567"
          };
          return supertest(app)
            .post("/api/users")
            .send(userShortPassword)
            .expect(400, { error: `Password be longer than 8 characters` });
        });

        it(`responds 400 'Password be less than 72 characters' when long password`, () => {
          const userLongPassword = {
            email: "test email",
            password: "*".repeat(73)
          };
          // console.log(userLongPassword)
          // console.log(userLongPassword.password.length)
          return supertest(app)
            .post("/api/users")
            .send(userLongPassword)
            .expect(400, { error: `Password be less than 72 characters` });
        });

        it(`responds 400 error when password starts with spaces`, () => {
          const userPasswordStartsSpaces = {
            email: "test email",
            password: " 1Aa!2Bb@"
          };
          return supertest(app)
            .post("/api/users")
            .send(userPasswordStartsSpaces)
            .expect(400, {
              error: `Password must not start or end with empty spaces`
            });
        });

        it(`responds 400 error when password ends with spaces`, () => {
          const userPasswordEndsSpaces = {
            email: "test email",
            password: "1Aa!2Bb@ "
          };
          return supertest(app)
            .post("/api/users")
            .send(userPasswordEndsSpaces)
            .expect(400, {
              error: `Password must not start or end with empty spaces`
            });
        });

        it(`responds 400 error when password isn't complex enough`, () => {
          const userPasswordNotComplex = {
            email: "test email",
            password: "11AAaabb"
          };
          return supertest(app)
            .post("/api/users")
            .send(userPasswordNotComplex)
            .expect(400, {
              error: `Password must contain 1 upper case, lower case, number and special character`
            });
        });

        it(`responds 400 'Email already taken' when email isn't unique`, () => {
          const duplicateUser = {
            email: testUser.email,
            password: "11AAaa!!"
          };
          return supertest(app)
            .post("/api/users")
            .send(duplicateUser)
            .expect(400, { error: `Email already taken` });
        });
      });

      context(`Happy path`, () => {
        it(`responds 201, serialized user, storing bcryped password`, () => {
          const newUser = {
            email: "test email",
            password: "11AAaa!!"
          };
          return supertest(app)
            .post("/api/users")
            .send(newUser)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property("id");
              expect(res.body.email).to.eql(newUser.email);
              expect(res.body).to.not.have.property("password");
              expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
              const expectedDate = new Date().toLocaleString("en", {
                timeZone: "UTC"
              });
              const actualDate = new Date(
                res.body.date_created
              ).toLocaleString();
              expect(actualDate).to.eql(expectedDate);
            })
            .expect(res =>
              db
                .from('ff_users')
                .select('*')
                .where({ id: res.body.id })
                .first()
                .then(row => {
                  expect(row.email).to.eql(newUser.email)
                  const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                  const actualDate = new Date(row.date_created).toLocaleString()
                  expect(actualDate).to.eql(expectedDate)

                  return bcrypt.compare(newUser.password, row.password)
                })
                .then(compareMatch => {
                  expect(compareMatch).to.be.true
                })
              )
        });
      });
    });
  });
});


// const { expect } = require('chai')
// const knex = require('knex')
// const app = require('../src/app')
// const { makeUsersArray, makeMaliciousUser } = require('./users.fixtures')

// describe('Users Endpoints', function() {
//   let db

//   before('make knex instance', () => {
//     db = knex({
//       client: 'pg',
//       connection: process.env.TEST_DB_URL,
//     })
//     app.set('db', db)
//   })

//   after('disconnect from db', () => db.destroy())

//   before('clean the table', () => db('ff_users').truncate())

//   afterEach('cleanup', () => db('ff_users').truncate())

//   describe.skip(`GET /api/users`, () => {
//     context(`Given no users`, () => {
//       it(`responds with 200 and an empty list`, () => {
//         return supertest(app)
//           .get('/api/users')
//           .expect(200, [])
//       })
//     })

//     context('Given there are users in the database', () => {
//       const testUsers = makeUsersArray()
      
//       beforeEach('insert users', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//       })
  
//       it('GET /api/users responds with 200 and all of the users', () => {
//         return supertest(app)
//           .get('/api/users')
//           .expect(200, testUsers)
//       })
//     })

//     context(`Given an XSS attack user`, () => {
//       const { maliciousUser, expectedUser } = makeMaliciousUser()

//       beforeEach('insert malicious user', () => {
//         return db
//           .into('ff_users')
//           .insert([ maliciousUser ])
//       })

//       it('removes XSS attack content', () => {
//         return supertest(app)
//           .get(`/api/users`)
//           .expect(200)
//           .expect(res => {
//             expect(res.body[0].email).to.eql(expectedUser.email)
//             expect(res.body[0].password).to.eql(expectedUser.password)
//           })
//       })
//     })
//   })
  
//   describe.skip(`GET /api/users/:user_id`, () => {
//     context(`Given no users`, () => {
//       it(`responds with 404`, () => {
//         const userId = 123456
//         return supertest(app)
//           .get(`/api/users/${userId}`)
//           .expect(404, { error: { message: `User doesn't exist` } })
//       })
//     })

//     context('Given there are users in the database', () => {
//       const testUsers = makeUsersArray()
      
//       beforeEach('insert users', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//       })

//       it('GET /api/users responds with 200 and all of the users', () => {
//         return supertest(app)
//           .get('/api/users')
//           .expect(200, testUsers)
//       })
  
//       it('GET /api/users/:user_id responds with 200 and the specified user', () => {
//         const userId = 2
//         const expectedUser = testUsers[userId - 1]
//         return supertest(app)
//           .get(`/api/users/${userId}`)
//           .expect(200, expectedUser)
//       })
//     })

//     context(`Given an XSS attack user`, () => {
//       const maliciousUser = {
//         id: 911,
//         email: 'Naughty naughty very naughty <script>alert("xss");</script>',
//         password: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
//       }
      
//       beforeEach('insert malicious user', () => {
//         return db
//           .into('ff_users')
//           .insert([ maliciousUser ])
//       })
      
//       it('removes XSS attack content', () => {
//         return supertest(app)
//           .get(`/api/users/${maliciousUser.id}`)
//           .expect(200)
//           .expect(res => {
//             expect(res.body.email).to.eql('Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;')
//             expect(res.body.password).to.eql(`Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`)
//           })
//       })
//     })
//   })

//   describe(`POST /api/users`, () => {
//     it(`creates an user, responding with 201 and the new user`, function() {
//       this.retries(3)
//       const newUser = {
//         email: 'Test new user',
//         password: 'password'
//       }

//       return supertest(app)
//         .post('/api/users')
//         .send(newUser)
//         .expect(201)
//         .expect(res => {
//           expect(res.body.email).to.eql(newUser.email)
//           expect(res.body.password).to.eql(newUser.password)
//           expect(res.body).to.have.property('id')
//           expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
//           const expected = new Date().toLocaleString()
//           const actual = new Date(res.body.date_created).toLocaleString()
//           expect(actual).to.eql(expected)
//         })
//         .then(postRes =>
//           supertest(app)
//             .get(`/api/users/${postRes.body.id}`)
//             .expect(postRes.body)
//         )
//     })

//     const requiredFields = ['email', 'password']

//     requiredFields.forEach(field => {
//       const newUser = {
//         email: 'tester@tester.com',
//         password: 'a123'
//       }

//       it(`responds with 400 and an error message when the '${field}' is missing`, () => {
//         delete newUser[field]

//         return supertest(app)
//           .post('/api/users')
//           .send(newUser)
//           .expect(400, {
//             error: { message: `Missing '${field}' in request body` }
//           })
//       })
//     })

//     it('removes XSS attack content from response', () => {
//       const { maliciousUser, expectedUser } = makeMaliciousUser()
//       return supertest(app)
//         .post(`/api/users`)
//         .send(maliciousUser)
//         .expect(201)
//         .expect(res => {
//           expect(res.body.email).to.eql(expectedUser.email)
//           expect(res.body.password).to.eql(expectedUser.password)
//         })
//     })
//   })

//   describe.skip(`DELETE /api/users/:user_id`, () => {
//     context(`Given no users`, () => {
//       it(`responds with 404`, () => {
//         const userId = 123456
//         return supertest(app)
//           .delete(`/api/users/${userId}`)
//           .expect(404, { error: { message: `User doesn't exist` } })
//       })
//     })

//     context('Given there are users in the database', () => {
//       const testUsers = makeUsersArray()
    
//       beforeEach('insert users', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//       })
      
//       it('responds with 204 and removes the user', () => {
//         const idToRemove = 2
//         const expectedUsers = testUsers.filter(user => user.id !== idToRemove)
//         return supertest(app)
//           .delete(`/api/users/${idToRemove}`)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/users`)
//               .expect(expectedUsers)
//          )
//       })
//     })
//   })

//   describe.skip(`PATCH /api/users/:user_id`, () => {
//     context(`Given no users`, () => {
//       it(`responds with 404`, () => {
//         const userId = 123456
//         return supertest(app)
//           .patch(`/api/users/${userId}`)
//           .expect(404, { error: { message: `User doesn't exist` } })
//       })
//     })

//     context('Given there are users in the database', () => {
//       const testUsers = makeUsersArray()
      
//       beforeEach('insert users', () => {
//         return db
//           .into('ff_users')
//           .insert(testUsers)
//       })
      
//       it('responds with 204 and updates the user', () => {
//         const idToUpdate = 2
//         const updateUser = {
//           email: 'updated user email',
//           password: 'Password',
//           date_modified: new Date().toISOString(),
//         }
//         const expectedUser = {
//           ...testUsers[idToUpdate - 1],
//           ...updateUser
//         }
//         return supertest(app)
//           .patch(`/api/users/${idToUpdate}`)
//           .send(updateUser)
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/users/${idToUpdate}`)
//               .expect(expectedUser)
//           )
//       })

//       it(`responds with 400 when no required fields supplied`, () => {
//         const idToUpdate = 2
//         return supertest(app)
//           .patch(`/api/users/${idToUpdate}`)
//           .send({ irrelevantField: 'foo' })
//           .expect(400, {
//             error: {
//               message: `Request body must contain either 'email', 'password', or 'date_modified'`
//             }
//           })
//       })

//       it(`responds with 204 when updating only a subset of fields`, () => {
//         const idToUpdate = 2
//         const updateUser = {
//           email: 'updated user email',
//         }
//         const expectedUser = {
//           ...testUsers[idToUpdate - 1],
//           ...updateUser
//         }
      
//         return supertest(app)
//           .patch(`/api/users/${idToUpdate}`)
//           .send({
//             ...updateUser,
//             fieldToIgnore: 'should not be in GET response'
//           })
//           .expect(204)
//           .then(res =>
//             supertest(app)
//               .get(`/api/users/${idToUpdate}`)
//               .expect(expectedUser)
//           )
        
//       })
//     })
//   })
// })