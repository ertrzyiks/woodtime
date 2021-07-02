const knex = require("../../knex");

module.exports = async (_, { name, checkpointCount }) => {
  const event = {
    name,
    checkpoint_count: checkpointCount,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const createdEvent = await knex.insert(event).into("events");

  return {
    success: true,
    event: createdEvent,
  };
};
