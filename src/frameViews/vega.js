const vega = require('vega');

module.exports = (frameContent) =>
  new Promise((resolve, reject) => {
    vega.parse.spec(frameContent.body, (err, chart) => {
      if(err) {
        reject(err);
        return;
      }

      const view = chart({ renderer: 'svg' }).update();

      const svgDoctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
        '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      const svgDoc = [svgDoctype, view.svg()].join('\n');
      const svgDocBase64 = new Buffer(svgDoc).toString('base64');

      resolve(`<img class="img-scalable" src=data:image/svg+xml;base64,${svgDocBase64}>`);
    });
  });
