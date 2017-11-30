import Devour from '../../vendor/devour-client/src';


const jsonApi = new Devour({
  apiUrl: process.env.IN_BROWSER ? '/api/v2' : 'http://localhost:3000/api/v2',
  pluralize: false,
});

jsonApi.define('notebooks', {
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

jsonApi.define('frames', {
  title: '',
  type: '',
  content: {},
  renderedContent: '',
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

jsonApi.define('tags', {
  name: '',
  notebook: {
    jsonApi: 'hasOne',
    type: 'notebooks',
  },
  createdAt: '',
  updatedAt: '',
});

jsonApi.define('apiKeys', {
  publicKey: '',
  secretKey: '',
  createdAt: '',
  updatedAt: '',
});


export default jsonApi;
