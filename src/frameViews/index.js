const frameViews = {};

const renderers = {
  text: require('./text'),
  vega: require('./vega')
};

frameViews.render = (frameContent) => renderers[frameContent.type](frameContent);

module.exports = frameViews;
