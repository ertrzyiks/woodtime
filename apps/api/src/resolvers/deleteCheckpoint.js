module.exports = async (_, { id }, { user, dataSources: { db }}) => {
  const checkpoint = await db.findCheckpointById(id)

  if (!checkpoint) {
    return {
      success: false
    }
  }

  const event = await db.findEventById(checkpoint.event_id)

  if (!event) {
    return {
      success: false
    }
  }

  const participant = await db.findParticipant({ userId: user.id, eventId: event.id })

  if (!participant) {
    return {
      success: false
    }
  }

  await db.deleteCheckpoint(id)

  return {
    id,
    success: true,
  };
};
