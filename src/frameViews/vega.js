import * as vega2 from 'vega-2';
import * as vega from 'vega';

const vega2SpecToSvg = (spec) =>
  new Promise((resolve, reject) => {
    vega2.parse.spec(spec, (err, chart) => {
      if(err) {
        reject(err);
        return;
      }

      const view = chart({ renderer: 'svg' }).update();
      resolve(view.svg());
    });
  });

const vega3SpecToSvg = (spec) => {
  const view = new vega.View(vega.parse(spec), {
    loader: vega.loader({ baseURL: null }),
    logLevel: vega.Warn,
    renderer: 'none'
  });
  return view.initialize().toSVG();
};

const vegaSpecToSvg = (spec) =>
  new Promise((resolve, reject) => {
    const schemaUrl = spec.$schema || 'https://vega.github.io/schema/vega/v2.6.json';
    const majorVersion = schemaUrl.match(/\/v(\d+)(.\d+)*\.json/)[1];
    switch(majorVersion) {
      case '3':
        resolve(vega3SpecToSvg(spec));
        return;
      case '2':
        resolve(vega2SpecToSvg(spec));
        return;
      default:
        reject(Error(`unrecognized Vega schema URL: ${schemaUrl}`));
    }
  });

export default (frameContent) =>
  vegaSpecToSvg(frameContent.body)
    .then((svg) => {
      const svgDoctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" ' +
        '"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
      const svgDoc = [svgDoctype, svg].join('\n');
      const svgDocBase64 = Buffer.from(svgDoc).toString('base64');

      return `<img class="img-scalable" src=data:image/svg+xml;base64,${svgDocBase64}>`;
    });
