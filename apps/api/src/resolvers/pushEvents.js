module.exports = async (_, { events }, { dataSources: { db }, user }) => {
  const results = await db.pushEvents(events, user.id);
  return results;
};
