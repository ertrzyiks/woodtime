const knex = require("../../knex");

module.exports = async (_, { id }) => {
  return knex
    .select("id", "name", "checkpoints", "created_at", "updated_at")
    .from("virtual_challenges")
    .where({ id })
    .then(data => {
      const entity = data[0]
      const checkpoints = JSON.parse(entity.checkpoints)

      return {
        ...entity,
        checkpoints: {
          points: checkpoints,
          totalCount: checkpoints.length
        }
      }
    })
}
