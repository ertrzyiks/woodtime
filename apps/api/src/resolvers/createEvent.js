const knex = require("../../knex");

module.exports = async (_, { name, checkpointCount }) => {
  const event = {
    name,
    checkpoint_count: checkpointCount,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  console.log("create event", name, checkpointCount);

  const createdEvent = await knex("events").insert(event);

  console.log("created", createdEvent);

  return {
    success: true,
    event: { id: createdEvent[0], ...event },
  };
};
