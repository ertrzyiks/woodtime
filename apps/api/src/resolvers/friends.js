module.exports = async (_, {}, { user, dataSources: { db } }) => {
  return db.findFriendForUser({ id: user.id })
};
