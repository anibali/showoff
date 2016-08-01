const notebooks = [
  {
    title: 'My notebook'
  },
  {
    title: 'My other notebook'
  }
];

for(var i = 0; i < 100; ++i) {
  notebooks.push({ title: 'Spam' });
}

const frames = [
  {
    notebookId: 1,
    title: 'A frame',
    type: 'text',
    content: {
      body: 'Enough content to keep you content.'
    }
  },
  {
    notebookId: 1,
    title: 'Another frame',
    type: 'text',
    content: {
      body: 'Why so many frames?'
    }
  },
  {
    notebookId: 1,
    title: 'A Vega graph',
    type: 'vega',
    content: {
      body: {
        width: 400,
        height: 270,
        data: [
          {
            name: 'table',
            values: [
              { x: 1, y: 28 }, { x: 2, y: 55 },
              { x: 3, y: 43 }, { x: 4, y: 91 },
              { x: 5, y: 81 }, { x: 6, y: 53 }
            ]
          }
        ],
        scales: [
          {
            name: 'x',
            type: 'linear',
            range: 'width',
            domain: { data: 'table', field: 'x' },
            nice: true
          },
          {
            name: 'y',
            type: 'linear',
            range: 'height',
            domain: { data: 'table', field: 'y' },
            nice: true
          }
        ],
        axes: [
          { type: 'x', scale: 'x' },
          { type: 'y', scale: 'y' }
        ],
        marks: [
          {
            type: 'line',
            from: { data: 'table' },
            properties: {
              enter: {
                x: { scale: 'x', field: 'x' },
                y: { scale: 'y', field: 'y' },
                stroke: { value: 'steelblue' }
              }
            }
          },
          {
            type: 'symbol',
            from: { data: 'table' },
            properties: {
              enter: {
                x: { scale: 'x', field: 'x' },
                y: { scale: 'y', field: 'y' },
                fill: { value: 'steelblue' }
              }
            }
          }
        ]
      }
    }
  },
  {
    notebookId: 2,
    title: 'A frame in the second notebook',
    type: 'text',
    content: {
      body: 'Yup, just hanging around.'
    }
  },
];

exports.seed = function(knex, Promise) {
  return (Promise.resolve()
    .then(() => knex('frames').del())
    .then(() => knex.raw('ALTER SEQUENCE frames_id_seq RESTART WITH 1;'))
    .then(() => knex('notebooks').del())
    .then(() => knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'))
    .then(() => Promise.all(notebooks.map((notebook) => knex('notebooks').insert(notebook))))
    .then(() => Promise.all(frames.map((frame) => knex('frames').insert(frame))))
  );
};
