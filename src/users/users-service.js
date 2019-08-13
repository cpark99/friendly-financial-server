const UsersService = {
  getAllUsers(knex) {
    return knex.select('*').from('ff_users')
  },
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('ff_users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('ff_users').select('*').where('id', id).first()
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