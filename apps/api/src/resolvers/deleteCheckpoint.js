const knex = require("../../knex");

module.exports = async (_, { id }) => {
  console.log("id", id);
  await knex("checkpoints").where({ id }).del();

  return {
    id,
    success: true,
  };
};
