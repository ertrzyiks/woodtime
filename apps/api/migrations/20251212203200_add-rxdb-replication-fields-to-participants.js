exports.up = async function (knex) {
  // Add deleted and _modified columns to participants table
  await knex.schema.alterTable('participants', (table) => {
    table.integer('deleted').defaultTo(0).notNullable();
    table.bigInteger('_modified').defaultTo(0).notNullable();
  });

  // Create triggers for participants table
  await knex.raw(`
    CREATE TRIGGER participants_modified_trigger
    AFTER INSERT ON participants
    BEGIN
      UPDATE participants 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  await knex.raw(`
    CREATE TRIGGER participants_modified_update_trigger
    AFTER UPDATE ON participants
    BEGIN
      UPDATE participants 
      SET _modified = (strftime('%s', 'now') * 1000)
      WHERE id = NEW.id;
    END;
  `);

  // Create indexes for participants
  await knex.raw(
    'CREATE INDEX idx_participants_modified ON participants(_modified)'
  );
  await knex.raw(
    'CREATE INDEX idx_participants_deleted ON participants(deleted)'
  );
};

exports.down = async function (knex) {
  // Drop triggers and indexes for participants
  await knex.raw('DROP TRIGGER IF EXISTS participants_modified_trigger');
  await knex.raw(
    'DROP TRIGGER IF EXISTS participants_modified_update_trigger'
  );
  await knex.raw('DROP INDEX IF EXISTS idx_participants_modified');
  await knex.raw('DROP INDEX IF EXISTS idx_participants_deleted');
  await knex.schema.alterTable('participants', (table) => {
    table.dropColumn('deleted');
    table.dropColumn('_modified');
  });
};
