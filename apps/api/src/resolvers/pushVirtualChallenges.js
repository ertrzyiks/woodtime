module.exports = async (_, { challenges }, { dataSources: { db } }) => {
  const results = await db.pushVirtualChallenges(challenges);
  return results;
};
