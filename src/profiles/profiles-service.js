const ProfilesService = {
  getAllProfiles(knex) {
    return knex.select('*').from('ff_profiles')
  },
  insertProfile(knex, newProfile) {
    return knex
      .insert(newProfile)
      .into('ff_profiles')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  getById(knex, id) {
    return knex.from('ff_profiles').select('*').where('id', id).first()
  },
  deleteProfile(knex, id) {
    return knex('ff_profiles')
      .where({ id })
      .delete()
  },
  updateProfile(knex, id, newProfileFields) {
    return knex('ff_profiles')
      .where({ id })
      .update(newProfileFields)
  },
}

module.exports = ProfilesService