const frameViews = {};

const renderers = {
  html: require('./html'),
  text: require('./text'),
  vega: require('./vega'),
  vegalite: require('./vegalite')
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

module.exports = frameViews;
