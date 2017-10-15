const escape = require('escape-html');

const plainTextToHtml = (text) =>
  `<pre>${escape(text)}</pre>`;

module.exports = (frameContent) => new Promise((resolve) =>
  resolve(plainTextToHtml(frameContent.body)));
