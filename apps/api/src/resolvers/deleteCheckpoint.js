const { AuthenticationError } = require("apollo-server-express");

const knex = require("../../knex");

module.exports = async (_, { id }, context) => {
  if (!context.user) {
    throw new AuthenticationError
  }

  await knex("checkpoints").where({ id }).del();

  return {
    id,
    success: true,
  };
};
