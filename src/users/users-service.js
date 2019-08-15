const xss = require('xss')
const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  hasUserWithEmail(db, email) {
    return db('ff_users')
      .where({ email })
      .first()
      .then(user => !!user)
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('ff_users')
      .returning('*')
      .then(([user]) => user)
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters'
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters'
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces'
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain 1 upper case, lower case, number and special character'
    }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  serializeUser(user) {
    return {
      id: user.id,
      email: xss(user.email),
      date_created: new Date(user.date_created),
    }
  },
}

module.exports = UsersService

// const UsersService = {
//   getAllUsers(knex) {
//     return knex.select('*').from('ff_users')
//   },
//   insertUser(knex, newUser) {
//     return knex
//       .insert(newUser)
//       .into('ff_users')
//       .returning('*')
//       .then(rows => {
//         return rows[0]
//       })
//   },
//   getById(knex, id) {
//     return knex.from('ff_users').select('*').where('id', id).first()
//   },
//   deleteUser(knex, id) {
//     return knex('ff_users')
//       .where({ id })
//       .delete()
//   },
//   updateUser(knex, id, newUserFields) {
//     return knex('ff_users')
//       .where({ id })
//       .update(newUserFields)
//   },
// }

// module.exports = UsersService