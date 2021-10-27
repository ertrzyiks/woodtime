module.exports = async (_, {}, { user, dataSources: { db } }) => {
  return db.findEventsForUser({ id: user.id })
};
