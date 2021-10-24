const knex = require("../../knex");

module.exports = async (_, { name }, context) => {
  const user = {
    name,
    source: 'direct',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const createdUsersIds = await knex("users").insert(user)
  const id = createdUsersIds[0]

  context.signIn(id)

  return {
    success: true,
    user: { id, ...user },
  }
}
