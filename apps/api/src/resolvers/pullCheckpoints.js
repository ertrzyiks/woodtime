module.exports = async (
  _,
  { limit, minUpdatedAt },
  { dataSources: { db } },
) => {
  const documents = await db.pullCheckpoints({ limit, minUpdatedAt });
  const checkpoint = await db.getCheckpointsCheckpoint();

  console.log("Pulled checkpoints:", { documents, checkpoint });

  return {
    documents,
    checkpoint,
  };
};
