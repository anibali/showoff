const notebooks = [
  {
    title: 'My notebook'
  }
];

const frames = [
  {
    notebookId: 1,
    title: 'A frame',
    content: {
      type: 'text',
      body: 'Enough content to keep you content.'
    }
  },
  {
    notebookId: 1,
    title: 'Another frame',
    content: {
      type: 'text',
      body: 'Why so many frames?'
    }
  },
  {
    notebookId: 1,
    title: 'A Vega graph',
    content: {
      type: 'vega',
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
  }
];

exports.seed = function(knex, Promise) {
  return (knex('frames').del()
    .then(() => knex('notebooks').del())
    .then(() => Promise.all(notebooks.map((notebook) => knex('notebooks').insert(notebook))))
    .then(() => Promise.all(frames.map((frame) => knex('frames').insert(frame))))
  );
};
