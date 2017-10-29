module.exports = (factory, models) => {
  factory.define('notebook', models('Notebook'), {
    id: factory.sequence('notebook.id'),
    title: factory.sequence('notebook.title', n => `Test notebook ${n}`),
    pinned: false,
    progress: 0.5,
  });

  factory.define('frame', models('Frame'), {
    id: factory.sequence('frame.id'),
    title: factory.sequence('frame.title', n => `Test frame ${n}`),
    type: 'text',
    content: { body: 'Lorem ipsum' },
    height: 600,
    width: 800,
    x: 0,
    y: 0,
    notebookId: factory.assoc('notebook', 'id'),
  });

  factory.define('tag', models('Tag'), {
    id: factory.sequence('tag.id'),
    name: factory.sequence('tag.title', n => `test-tag-${n}`),
    notebookId: factory.assoc('notebook', 'id'),
  });
};
