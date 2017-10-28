const notebooks = [
  {
    title: 'My notebook'
  },
  {
    title: 'My other notebook'
  }
];

for(let i = 0; i < 10; ++i) {
  notebooks.push({ title: 'Spam' });
}

notebooks.push({
  title: 'This notebook has a very long title that just seems to go on and on' +
    ' and on and on and on, with little point except to test that the' +
    ' interface can handle long titles'
});

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
  {
    notebookId: 2,
    title: 'Vega-lite',
    type: 'vegalite',
    content: {
      body: {
        data: {
          values: [
            { target: 1, actual: 1, frequency: 0.4 },
            { target: 10, actual: 8, frequency: 0.1 },
            { target: 10, actual: 10, frequency: 0.1 }
          ]
        },
        mark: 'text',
        encoding: {
          row: { field: 'target', type: 'ordinal' },
          column: { field: 'actual', type: 'ordinal' },
          color: { field: 'frequency', scale: { domain: [0, 1] } },
          text: { field: 'frequency' }
        },
        config: {
          mark: { applyColorToBackground: true },
          scale: { textBandWidth: 50 }
        }
      }
    }
  },
];

exports.seed = function(knex, Promise) {
  let time = 1508455148000;
  notebooks.forEach(notebook => {
    notebook.createdAt = new Date(time);
    notebook.updatedAt = new Date(time);
    time += 1000;
  });
  frames.forEach(frame => {
    frame.createdAt = new Date(time);
    frame.updatedAt = new Date(time);
    time += 1000;
  });
  return (Promise.resolve()
    .then(() => knex('frames').del())
    .then(() => knex.raw('ALTER SEQUENCE frames_id_seq RESTART WITH 1;'))
    .then(() => knex('notebooks').del())
    .then(() => knex.raw('ALTER SEQUENCE notebooks_id_seq RESTART WITH 1;'))
    .then(() => Promise.all(notebooks.map((notebook) => knex('notebooks').insert(notebook))))
    .then(() => Promise.all(frames.map((frame) => knex('frames').insert(frame))))
  );
};
