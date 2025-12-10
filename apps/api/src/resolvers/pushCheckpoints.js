module.exports = async (_, { checkpoints }, { dataSources: { db } }) => {
  const results = await db.pushCheckpoints(checkpoints);
  return results;
};
