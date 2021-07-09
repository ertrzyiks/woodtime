const knex = require("../../knex");

module.exports = async (_, { id }) => {
  await knex("checkpoints").where({ id }).del();

  return {
    id,
    success: true,
  };
};
