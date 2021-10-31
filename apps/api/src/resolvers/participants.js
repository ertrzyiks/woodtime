module.exports = async ({ id }, _, { dataSources: { db }}) => {
  return db.findParticipantsForEvent(id)
}
