const knex = require("../../knex");

module.exports = async (_, { name, checkpointCount }) => {
  const event = {
    name,
    checkpoint_count: checkpointCount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdEventIds = await knex("events").insert(event);

  return {
    success: true,
    event: { id: createdEventIds[0], ...event },
  };
};
