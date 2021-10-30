module.exports = async (
  _,
  { event_id, cp_id, cp_code, skipped, skip_reason },
  { user, dataSources: { db } }
) => {
  const event = await db.findEventById(event_id)

  if (!event) {
    return {
      success: false
    }
  }

  const participant = await db.findParticipant({ userId: user.id, eventId: event_id })

  if (!participant) {
    return {
      success: false
    }
  }

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
