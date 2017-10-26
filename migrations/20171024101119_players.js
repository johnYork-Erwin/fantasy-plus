'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('players', table => {
    table.increments();
    table.integer('team_id').references('teams.id').notNullable().onDelete('CASCADE');
    table.string('player_name').notNullable();
    table.integer('jersey_number').notNullable();
    table.string('position').notNullable();
    table.json('stats').defaultTo(JSON.stringify({}));
    table.integer('total_points').notNullable();
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players');
};
