module.exports = async (
  _,
  { limit, minUpdatedAt },
  { user, dataSources: { db } },
) => {
  const documents = await db.pullParticipants({
    limit,
    minUpdatedAt,
    userId: user.id,
  });

  return {
    documents,
    checkpoint: {
      lastModified:
        documents.length > 0 ? documents[documents.length - 1]._modified : 0,
    },
  };
};
