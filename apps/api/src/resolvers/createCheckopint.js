const knex = require("../../knex");

module.exports = async (
  _,
  { event_id, cp_id, cp_code, skipped, skip_reason },
  { dataSources: { db } }
) => {
  const checkpoint = await db.createCheckpoint({
    eventId: event_id,
    cpId: cp_id,
    cpCode: cp_code,
    skipped,
    skipReason: skip_reason
  })

  return {
    success: true,
    checkpoint,
  };
};
