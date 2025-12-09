module.exports = async (
  _,
  { limit, minUpdatedAt },
  { dataSources: { db } }
) => {
  const documents = await db.pullVirtualChallenges({ limit, minUpdatedAt });
  const checkpoint = await db.getVirtualChallengesCheckpoint();

  return {
    documents,
    checkpoint,
  };
};
