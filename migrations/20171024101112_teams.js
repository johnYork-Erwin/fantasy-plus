'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('teams', table => {
    table.increments();
    table.string('team_name').notNullable();
    table.string('team_code').notNullable();
    table.json('stats');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('teams');
};
