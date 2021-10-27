module.exports = async (_, { id }, { dataSources: { db }}) => {
  await db.deleteCheckpoint(id)

  return {
    id,
    success: true,
  };
};
