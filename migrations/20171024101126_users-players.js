'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('users-players', table => {
    table.increments();
    table.integer('user_id').references('users.id').notNullable().onDelete('CASCADE');
    table.integer('player_id').references('players.id').notNullable().onDelete('CASCADE');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users-players');
};
