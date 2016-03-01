const React = require('react');
const reactDomServer = require('react-dom/server');

const plainTextToHtml = (text) =>
  reactDomServer.renderToString(<pre>{text}</pre>);

module.exports = (frameContent) => new Promise((resolve) =>
  resolve(plainTextToHtml(frameContent.body)));
