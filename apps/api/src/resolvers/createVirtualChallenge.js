const knex = require("../../knex");

module.exports = async (_, { input }) => {
  const challenge = {
    name: input.name,
    checkpoints: JSON.stringify(input.checkpoints),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const createdIds = await knex("virtual_challenges").insert(challenge);

  return {
    success: true,
    virtualChallenge: {
      id: createdIds[0],
      ...challenge,
      checkpoints: {
        points: input.checkpoints,
        totalCount: input.checkpoints.length
      }
    }
  };
};
