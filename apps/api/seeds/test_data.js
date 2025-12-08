exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('participants').del();
  await knex('checkpoints').del();
  await knex('events').del();
  await knex('users').del();

  // Insert seed entries
  await knex('users').insert([
    {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      source: 'test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  await knex('events').insert([
    {
      id: 1,
      name: 'Sample Event',
      type: 1,
      checkpoint_count: 5,
      invite_token: 'test-invite-token-123',
      virtual_challenge_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);

  await knex('participants').insert([
    {
      id: 1,
      user_id: 1,
      event_id: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]);
};
