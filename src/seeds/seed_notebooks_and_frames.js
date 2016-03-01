const notebooks = [
  {
    id: 1,
    title: 'My notebook'
  }
];

const frames = [
  {
    id: 1,
    notebookId: 1,
    title: 'A frame',
    content: {
      type: 'text',
      body: 'Enough content to keep you content.'
    }
  },
  {
    id: 2,
    notebookId: 1,
    title: 'Another frame',
    content: {
      type: 'text',
      body: 'Why so many frames?'
    }
  }
];

exports.seed = function(knex, Promise) {
  return (knex('frames').del()
    .then(() => knex('notebooks').del())
    .then(() => Promise.all([
      ...notebooks.map((notebook) => knex('notebooks').insert(notebook)),
      ...frames.map((frame) => knex('frames').insert(frame))
    ]))
  );
};
