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
  getById(db, id) {
    return db
      .from('ff_users AS u')
      .select(
        'u.id',
        'u.name',
        'u.email',
        'u.phone',
        'u.life_insurance_goal',
        'u.get_email',
        'u.get_call',
        'u.get_newsletter',
        'u.date_created'
      )
      .where('u.id', id)
      .first()
  },
  serializeUser(user) {
    return {
      id: user.id,
      name: xss(user.name),
      email: xss(user.email),
      phone: xss(user.phone),
      life_insurance_goal: xss(user.life_insurance_goal),
      get_email: user.get_email,
      get_call: user.get_call,
      get_newsletter: user.get_newsletter,
      date_created: new Date(user.date_created)
    }
  },
  deleteUser(knex, id) {
    return knex('ff_users')
      .where({ id })
      .delete()
  },
  updateUser(knex, id, newUserFields) {
    return knex('ff_users')
      .where({ id })
      .update(newUserFields)
  },
}

module.exports = UsersService
