module.exports = async (
  _,
  { limit, minUpdatedAt },
  { dataSources: { db } },
) => {
  const documents = await db.pullEvents({ limit, minUpdatedAt });

  return {
    documents,
    checkpoint: {
      lastModified:
        documents.length > 0 ? documents[documents.length - 1]._modified : 0,
    },
  };
};
