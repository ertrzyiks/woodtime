module.exports = async (_, { name, checkpointCount, type }, { user, dataSources: { db } }) => {
  const event = await db.createEvent({
    name,
    type,
    checkpointCount
  })

  await db.createParticipant({
    userId: user.id,
    eventId: event.id,
  })

  return {
    success: true,
    event,
  };
};
