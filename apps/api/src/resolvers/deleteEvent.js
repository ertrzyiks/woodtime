const knex = require("../../knex");

module.exports = async (_, { id }) => {
  await knex("events").where({ id }).del();

  return {
    id,
    success: true,
  };
};
