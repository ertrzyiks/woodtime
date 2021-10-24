const knex = require("../../knex");

module.exports = async function getUser(id) {
  if (!id) {
    return
  }

  const user = await knex
    .select('id', 'name')
    .from('users')
    .where({ id })

  return user[0]
};
