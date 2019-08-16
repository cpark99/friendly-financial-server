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
  getById(db, id) {
    console.log(`getById(id): ${id}`)
    return db
      .from('ff_profiles AS p')
      .select(
        'p.name',
        'p.email',
        'p.phone',
        'p.life_insurance_goal',
        'p.get_email',
        'p.get_call',
        'p.get_newsletter'
      )
      .leftJoin(
        'ff_users AS u',
        'p.email',
        'u.email',
      )
      .where('p.id', id)
      .first()
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