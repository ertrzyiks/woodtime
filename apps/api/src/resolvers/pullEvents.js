module.exports = async (_, { limit, minUpdatedAt }, { dataSources: { db } }) => {
  const documents = await db.pullEvents({ limit, minUpdatedAt });
  const checkpoint = await db.getEventsCheckpoint();

  return {
    documents,
    checkpoint,
  };
};
