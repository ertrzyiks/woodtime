const knex = require("../../knex");

module.exports = async () => {
  return knex
    .select("id", "name", "checkpoints", "created_at", "updated_at")
    .from("virtual_challenges").then(data => {
      const nodes = data.map(entity => {
        const checkpoints = JSON.parse(entity.checkpoints)

        return {
          ...entity,
          checkpoints: {
            points: checkpoints,
            totalCount: checkpoints.length
          }
        }
      })

      return {
        nodes,
        totalCount: nodes.length
      }
    })
}
