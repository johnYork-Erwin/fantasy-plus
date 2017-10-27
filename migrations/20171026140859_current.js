'use strict';

exports.up = function(knex, Promise) {
  return knex.schema.createTable('current', table => {
    table.increments();
    table.integer('upToDateThrough');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('current');
};
