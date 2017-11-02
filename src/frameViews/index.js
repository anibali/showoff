const frameViews = {};

import html from './html';
import text from './text';
import vega from './vega';
import vegalite from './vegalite';

const renderers = {
  html,
  text,
  vega,
  vegalite
};

frameViews.render = (frame) => {
  const frameView = renderers[frame.type];
  if(!frameView) {
    return new Promise((resolve) => {
      resolve('');
    });
  }
  return renderers[frame.type](frame.content);
};

export default frameViews;
