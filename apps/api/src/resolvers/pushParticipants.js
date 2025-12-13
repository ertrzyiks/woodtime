module.exports = async (_, { participants }, { dataSources: { db } }) => {
  const results = await db.pushParticipants(participants);
  return results;
};
