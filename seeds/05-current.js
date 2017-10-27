exports.seed = function(knex, Promise) {
  return knex('current').del()
    .then(() => {
      return knex.raw(
        "SELECT setval('current_id_seq', 1, false);"
      )
    })
    .then(() => {
      return knex('current').insert({upToDateThrough: 0});
    })
    .then(() => {
      return knex.raw(
        "SELECT setval('current_id_seq', (SELECT MAX(id) FROM current));"
      );
    });
};
