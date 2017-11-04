import * as vegalite1 from 'vega-lite-1';
import * as vegalite2 from 'vega-lite';

import vegaFrameView from './vega';

const vegaliteCompile = (spec) => new Promise((resolve, reject) => {
  const schemaUrl = spec.$schema || 'https://vega.github.io/schema/vega-lite/v1.json';
  const majorVersion = schemaUrl.match(/\/v(\d+)(.\d+)*\.json/)[1];
  switch(majorVersion) {
    case '2':
      resolve(vegalite2.compile(spec).spec);
      return;
    case '1':
      resolve(vegalite1.compile(spec).spec);
      return;
    default:
      reject(Error(`unrecognized Vega-Lite schema URL: ${schemaUrl}`));
  }
});

export default (frameContent) =>
  vegaliteCompile(frameContent.body)
    .then(spec => Object.assign({ $schema: 'https://vega.github.io/schema/vega/v2.6.json' }, spec))
    .then(spec => vegaFrameView({ body: spec }));
