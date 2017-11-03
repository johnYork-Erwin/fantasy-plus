'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('players', table => {
    table.increments();
    table.integer('team_id').references('teams.id').notNullable().onDelete('CASCADE');
    table.string('player_name').notNullable();
    table.string('player_name_full');
    table.integer('jersey_number');
    table.string('position');
    table.string('headshot');
    table.json('stats');
    table.decimal('total_points').notNullable();
    table.string('college');
    table.integer('height');
    table.integer('weight');
    table.string('birthdate');
    table.string('status');
    table.string('team_code');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('players');
};
