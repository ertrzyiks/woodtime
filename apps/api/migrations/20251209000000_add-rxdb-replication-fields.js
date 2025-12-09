exports.up = async function (knex) {
  // Add deleted and _modified columns to events table
  await knex.schema.alterTable('events', (table) => {
    table.integer('deleted').defaultTo(0).notNullable();
    table.bigInteger('_modified').defaultTo(0).notNullable();
  });

  // Create triggers for events table
  await knex.raw(`
    CREATE TRIGGER events_modified_trigger
    AFTER INSERT ON events
    BEGIN
      UPDATE events 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER events_modified_update_trigger
    AFTER UPDATE ON events
    BEGIN
      UPDATE events 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  // Create indexes for events
  await knex.raw('CREATE INDEX idx_events_modified ON events(_modified)');
  await knex.raw('CREATE INDEX idx_events_deleted ON events(deleted)');

  // Add deleted and _modified columns to checkpoints table
  await knex.schema.alterTable('checkpoints', (table) => {
    table.integer('deleted').defaultTo(0).notNullable();
    table.bigInteger('_modified').defaultTo(0).notNullable();
  });

  // Create triggers for checkpoints table
  await knex.raw(`
    CREATE TRIGGER checkpoints_modified_trigger
    AFTER INSERT ON checkpoints
    BEGIN
      UPDATE checkpoints 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER checkpoints_modified_update_trigger
    AFTER UPDATE ON checkpoints
    BEGIN
      UPDATE checkpoints 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  // Create indexes for checkpoints
  await knex.raw(
    'CREATE INDEX idx_checkpoints_modified ON checkpoints(_modified)'
  );
  await knex.raw(
    'CREATE INDEX idx_checkpoints_deleted ON checkpoints(deleted)'
  );

  // Add deleted and _modified columns to virtual_challenges table
  await knex.schema.alterTable('virtual_challenges', (table) => {
    table.integer('deleted').defaultTo(0).notNullable();
    table.bigInteger('_modified').defaultTo(0).notNullable();
  });

  // Create triggers for virtual_challenges table
  await knex.raw(`
    CREATE TRIGGER virtual_challenges_modified_trigger
    AFTER INSERT ON virtual_challenges
    BEGIN
      UPDATE virtual_challenges 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER virtual_challenges_modified_update_trigger
    AFTER UPDATE ON virtual_challenges
    BEGIN
      UPDATE virtual_challenges 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  // Create indexes for virtual_challenges
  await knex.raw(
    'CREATE INDEX idx_virtual_challenges_modified ON virtual_challenges(_modified)'
  );
  await knex.raw(
    'CREATE INDEX idx_virtual_challenges_deleted ON virtual_challenges(deleted)'
  );

  // Add deleted and _modified columns to users table
  await knex.schema.alterTable('users', (table) => {
    table.integer('deleted').defaultTo(0).notNullable();
    table.bigInteger('_modified').defaultTo(0).notNullable();
  });

  // Create triggers for users table
  await knex.raw(`
    CREATE TRIGGER users_modified_trigger
    AFTER INSERT ON users
    BEGIN
      UPDATE users 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER users_modified_update_trigger
    AFTER UPDATE ON users
    BEGIN
      UPDATE users 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  // Create indexes for users
  await knex.raw('CREATE INDEX idx_users_modified ON users(_modified)');
  await knex.raw('CREATE INDEX idx_users_deleted ON users(deleted)');
};

exports.down = async function (knex) {
  // Drop triggers and indexes for events
  await knex.raw('DROP TRIGGER IF EXISTS events_modified_trigger');
  await knex.raw('DROP TRIGGER IF EXISTS events_modified_update_trigger');
  await knex.raw('DROP INDEX IF EXISTS idx_events_modified');
  await knex.raw('DROP INDEX IF EXISTS idx_events_deleted');
  await knex.schema.alterTable('events', (table) => {
    table.dropColumn('deleted');
    table.dropColumn('_modified');
  });

  // Drop triggers and indexes for checkpoints
  await knex.raw('DROP TRIGGER IF EXISTS checkpoints_modified_trigger');
  await knex.raw('DROP TRIGGER IF EXISTS checkpoints_modified_update_trigger');
  await knex.raw('DROP INDEX IF EXISTS idx_checkpoints_modified');
  await knex.raw('DROP INDEX IF EXISTS idx_checkpoints_deleted');
  await knex.schema.alterTable('checkpoints', (table) => {
    table.dropColumn('deleted');
    table.dropColumn('_modified');
  });

  // Drop triggers and indexes for virtual_challenges
  await knex.raw('DROP TRIGGER IF EXISTS virtual_challenges_modified_trigger');
  await knex.raw(
    'DROP TRIGGER IF EXISTS virtual_challenges_modified_update_trigger'
  );
  await knex.raw('DROP INDEX IF EXISTS idx_virtual_challenges_modified');
  await knex.raw('DROP INDEX IF EXISTS idx_virtual_challenges_deleted');
  await knex.schema.alterTable('virtual_challenges', (table) => {
    table.dropColumn('deleted');
    table.dropColumn('_modified');
  });

  // Drop triggers and indexes for users
  await knex.raw('DROP TRIGGER IF EXISTS users_modified_trigger');
  await knex.raw('DROP TRIGGER IF EXISTS users_modified_update_trigger');
  await knex.raw('DROP INDEX IF EXISTS idx_users_modified');
  await knex.raw('DROP INDEX IF EXISTS idx_users_deleted');
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('deleted');
    table.dropColumn('_modified');
  });
};
