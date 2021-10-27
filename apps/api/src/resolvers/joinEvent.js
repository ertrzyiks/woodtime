module.exports = async (_, { id, token }, { user, dataSources: { db } }) => {
  const event = await db.findEventById(id)

  if (!event) {
    return {
      success: false
    }
  }

  const participant = await db.findParticipant({ userId: user.id, eventId: event.id })

  if (participant) {
    return {
      success: true,
      event
    }
  }

  if (token !== event.invite_token) {
    return {
      success: false
    }
  }

  await db.createParticipant({ userId: user.id, eventId: event.id })

  return {
    success: true,
    event,
  };
};
