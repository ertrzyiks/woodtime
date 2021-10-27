module.exports = async (_, { id }, { dataSources: { db }}) => {
  await db.deleteEventById(id)

  return {
    id,
    success: true,
  };
};
