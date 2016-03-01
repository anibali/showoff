const frameViews = {};

const renderers = {
  html: require('./html'),
  text: require('./text'),
  vega: require('./vega')
};

frameViews.render = (frameContent) => renderers[frameContent.type](frameContent);

module.exports = frameViews;
