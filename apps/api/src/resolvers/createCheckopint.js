const knex = require("../../knex");

module.exports = async (
  _,
  { event_id, cp_id, cp_code, skipped, skip_reason }
) => {
  const checkpoint = {
    event_id,
    cp_id,
    cp_code,
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
