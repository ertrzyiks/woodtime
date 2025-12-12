module.exports = async (_, { checkpoints }, { user, dataSources: { db } }) => {
  const results = await db.pushCheckpoints(checkpoints, user.id);
  return results;
};
