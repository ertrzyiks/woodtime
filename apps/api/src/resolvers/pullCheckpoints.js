module.exports = async (
  _,
  { limit, minUpdatedAt },
  { user, dataSources: { db } },
) => {
  const documents = await db.pullCheckpoints({
    limit,
    minUpdatedAt,
    userId: user.id,
  });
  const checkpoint = await db.getCheckpointsCheckpoint();

  return {
    documents,
    checkpoint,
  };
};
