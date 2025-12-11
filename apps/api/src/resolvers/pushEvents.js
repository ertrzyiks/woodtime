module.exports = async (_, { events }, { dataSources: { db } }) => {
  const results = await db.pushEvents(events);
  console.log("Pushing events:", events, "Results:", results);
  return results;
};
