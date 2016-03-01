module.exports = (frameContent) =>
  new Promise((resolve) => resolve(`<pre>${frameContent.body}</pre>`));
