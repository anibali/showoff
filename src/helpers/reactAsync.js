/**
 * Registering promises here allows the server to wait for them to resolve
 * before serving up the rendered React HTML.
 */

const reactAsync = {
  promises: [],
  addPromise: function(promise) {
    this.promises.push(promise);
  }
};

module.exports = reactAsync;
