const knex = require("../../knex");
const { AuthenticationError } = require("apollo-server-express");

module.exports = async (
  _,
  { event_id, cp_id, cp_code, skipped, skip_reason },
  context
) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  const checkpoint = {
    event_id,
    cp_id,
    cp_code: cp_code || null,
    skipped,
    skip_reason: skip_reason || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdCheckpointIds = await knex("checkpoints").insert(checkpoint);

  return {
    success: true,
    checkpoint: { id: createdCheckpointIds[0], ...checkpoint },
  };
};
