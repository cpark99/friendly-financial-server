const knex = require("knex");
const bcrypt = require('bcryptjs')
const app = require("../src/app");
const helpers = require("./test-helpers");

describe("Users Endpoints", function() {
  let db;

  const { testUsers } = helpers.makeUsersFixtures();
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

      const requiredFields = ["email", "password", "name", "phone", "get_email", "get_call", "get_newsletter"];

      requiredFields.forEach(field => {
        const registerAttemptBody = {
          email: "test email",
          password: "test password",
          name: "test name",
          phone: "8888888888",
          get_email: true,
          get_call: true,
          get_newsletter: true
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
            password: "1234567",
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
          };
          return supertest(app)
            .post("/api/users")
            .send(userShortPassword)
            .expect(400, { error: `Password be longer than 8 characters` });
        });

        it(`responds 400 'Password be less than 72 characters' when long password`, () => {
          const userLongPassword = {
            email: "test email",
            password: "*".repeat(73),
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
          };
          return supertest(app)
            .post("/api/users")
            .send(userLongPassword)
            .expect(400, { error: `Password be less than 72 characters` });
        });

        it(`responds 400 error when password starts with spaces`, () => {
          const userPasswordStartsSpaces = {
            email: "test email",
            password: " 1Aa!2Bb@",
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
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
            password: "1Aa!2Bb@ ",
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
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
            password: "11AAaabb",
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
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
            password: "11AAaa!!",
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
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
            email: "test@test.com",
            password: "11AAaa!!",
            name: "test name",
            phone: "8888888888",
            get_email: true,
            get_call: true,
            get_newsletter: true
          }

          return supertest(app)
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect(res => {
              expect(res.body).to.have.property("id");
              expect(res.body.email).to.eql(newUser.email);
              expect(res.body.name).to.eql(newUser.name);
              expect(res.body.phone).to.eql(newUser.phone);
              expect(res.body.get_email).to.eql(newUser.get_email);
              expect(res.body.get_call).to.eql(newUser.get_call);
              expect(res.body.get_newsletter).to.eql(newUser.get_newsletter);
              expect(res.body).to.not.have.property("password");
              expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
              const expectedDate = new Date().toLocaleString("en", { timeZone: "UTC" });
              const actualDate = new Date(res.body.date_created).toLocaleString();
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
                  expect(row.name).to.eql(newUser.name)
                  expect(row.phone).to.eql(newUser.phone)
                  expect(row.get_email).to.eql(newUser.get_email)
                  expect(row.get_call).to.eql(newUser.get_call)
                  expect(row.get_newsletter).to.eql(newUser.get_newsletter)
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

  describe(`GET /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers))

      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `user doesn't exist` })
      })
    })

    context('Given there are profiles in the database', () => {
      beforeEach('insert users', () =>
        helpers.seedUsers(
          db,
          testUsers
        )
      )

      it('responds with 200 and the specified user', () => {
        const userId = 2
        const expectedUser = helpers.makeExpectedUser(
          testUsers,
          testUsers[userId - 1],
        )

        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedUser)
      })
    })

    context(`Given an XSS attack user`, () => {
      const {
        maliciousUser,
        expectedUser,
      } = helpers.makeMaliciousUser(testUser)

      beforeEach('insert malicious user', () => {
        return helpers.seedMaliciousUser(
          db,
          maliciousUser,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/users/${maliciousUser.id}`)
          .set('Authorization', helpers.makeAuthHeader(maliciousUser))
          .expect(200)
          .expect(res => {
            expect(res.body.name).to.eql(expectedUser.name)
            expect(res.body.life_insurance_goal).to.eql(expectedUser.life_insurance_goal)
          })
      })
    })
  })

  describe(`PATCH /api/users/:user_id`, () => {
    context(`Given no users`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers))

      it(`responds with 404`, () => {
        const userId = 123456
        return supertest(app)
          .patch(`/api/users/${userId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `user doesn't exist` })
      })
    })

    context('Given there are users in the database', () => {
      const testUsers = helpers.makeUsersArray()
      
      beforeEach('insert users', () => {
        return db
          .into('ff_users')
          .insert(testUsers)
      })
      
      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2
        const updateUser = {
          life_insurance_goal: 'updated goal'
        }
        let expectedUser = helpers.makeExpectedUser(
          testUsers,
          testUsers[idToUpdate - 1],
        )
        expectedUser = {
          ...expectedUser,
          ...updateUser
        }
        
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(updateUser)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedUser)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(400, {
            error: {
              message: `Request body must contain 'life_insurance_goal'`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateUser = {
          life_insurance_goal: 'updated goal'
        }
        let expectedUser = helpers.makeExpectedUser(
          testUsers,
          testUsers[idToUpdate - 1],
        )
        expectedUser = {
          ...expectedUser,
          ...updateUser
        }
      
        return supertest(app)
          .patch(`/api/users/${idToUpdate}`)
          .send({
            ...updateUser,
            fieldToIgnore: 'should not be in GET response'
          })
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/users/${idToUpdate}`)
              .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
              .expect(expectedUser)
          )
      })
    })
  })
});
