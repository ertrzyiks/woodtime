const knex = require("../../knex");

module.exports = async (_, { cpId, cpCode, skipped, skipReason }) => {
  const checkpoint = {
    cp_id: cpId,
    cp_code: cpCode,
    skipped,
    skip_reason: skipReason,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdCheckpoint = await knex.insert(checkpoint).into("checkpoints");

  return {
    success: true,
    checkpoint: createdCheckpoint,
  };
};
