module.exports = async (_, { id }, { dataSources: { db } }) => {
  return db.findEventById(id)
};
