module.exports = async (_, { id, friendId }, { user, dataSources: { db } }) => {
  const event = await db.findEventById(id)

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

  const isFriend = await db.isFriendForUser({ id: user.id, friendId })

  if (!isFriend) {
    return {
      success: false
    }
  }

  const friendParticipant = await db.findParticipant({ userId: friendId, eventId: event.id })

  if (friendParticipant) {
    return {
      success: true,
      event
    }
  }

  await db.createParticipant({ userId: friendId, eventId: event.id })

  return {
    success: true,
    event
  };
};
