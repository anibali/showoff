import Plotly from 'plotly.js/lib/core';
import Scatter from 'plotly.js/lib/scatter';
import Scatter3d from 'plotly.js/lib/scatter3d';
import Bar from 'plotly.js/lib/bar';
import Box from 'plotly.js/lib/box';
import Histogram from 'plotly.js/lib/histogram';


Plotly.register([
  Scatter,
  Scatter3d,
  Bar,
  Box,
  Histogram,
]);


export default Plotly;
