const tags = [
  {
    name: 'not-spam',
    notebookId: 1,
  },
  {
    name: 'not-spam',
    notebookId: 2,
  },
  {
    name: 'vega-lite',
    notebookId: 2,
  },
];

for(let i = 3; i < 13; ++i) {
  tags.push({ name: 'spam', notebookId: i });
}

exports.seed = function(knex, Promise) {
  tags.forEach(tag => {
    tag.createdAt = new Date();
    tag.updatedAt = new Date();
  });
  return (Promise.resolve()
    .then(() => knex('tags').del())
    .then(() => knex.raw('ALTER SEQUENCE tags_id_seq RESTART WITH 1;'))
    .then(() => Promise.all(tags.map((tag) => knex('tags').insert(tag))))
  );
};
