import vega from 'vega';
import vl from 'vega-lite';

export default (frameContent) =>
  new Promise((resolve, reject) => {
    const spec = vl.compile(frameContent.body).spec;
    vega.parse.spec(spec, (err, chart) => {
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
