const vega = require('vega');

module.exports = (frameContent) =>
  new Promise((resolve, reject) => {
    vega.parse.spec(frameContent.body, (err, chart) => {
      if(err) { reject(err); }

      const view = chart({ renderer: 'svg' }).update();

      resolve(view.svg());
    });
  });
