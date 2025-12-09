module.exports = async (_, { events }, { dataSources: { db } }) => {
  const results = await db.pushEvents(events);
  return results;
};
