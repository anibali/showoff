import escape from 'escape-html';

const plainTextToHtml = (text) =>
  `<pre>${escape(text)}</pre>`;

export default (frameContent) => new Promise((resolve) =>
  resolve(plainTextToHtml(frameContent.body)));
