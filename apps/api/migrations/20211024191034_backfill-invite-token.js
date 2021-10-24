
exports.up = function(knex) {
  return knex('events')
    .update({ invite_token: '123' })
}

exports.down = function(knex) {

};
