import Devour from 'devour-client';


const jsonApi = new Devour({
  apiUrl: process.env.IN_BROWSER ? '/api/v2' : 'http://localhost:3000/api/v2',
});

jsonApi.define('notebook', {
  title: '',
  pinned: false,
  progress: -1,
  frames: {
    jsonApi: 'hasMany',
    type: 'frames'
  },
  tags: {
    jsonApi: 'hasMany',
    type: 'tags'
  },
  createdAt: '',
  updatedAt: '',
});

jsonApi.define('frame', {
  title: '',
  type: '',
  content: {},
  renderedContent: '',
  notebookId: '0',
  x: 0,
  y: 0,
  width: 800,
  height: 600,
  notebook: {
    jsonApi: 'hasOne',
    type: 'notebooks',
  },
  createdAt: '',
  updatedAt: '',
});

jsonApi.define('tag', {
  name: '',
  notebookId: '0',
  notebook: {
    jsonApi: 'hasOne',
    type: 'notebooks',
  },
  createdAt: '',
  updatedAt: '',
});


export default jsonApi;
