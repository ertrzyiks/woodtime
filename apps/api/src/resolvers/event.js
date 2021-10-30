module.exports = async (_, { id }, { user, dataSources: { db } }) => {
  const participant = await db.findParticipant({ userId: user.id, eventId: id })

  if (!participant) {
    return null
  }

  return db.findEventById(id)
};
