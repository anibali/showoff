class MustHttp {
  static register(Must) {
    Must.prototype.status = function(expected) {
      const opts = { actual: this.actual.status, expected };
      this.assert(this.actual.status === expected, 'have status', opts);
      return this;
    };

    Must.prototype.contentType = function(expected) {
      const contentType = this.actual.headers.get('content-type');
      const opts = { actual: contentType, expected };
      this.assert(contentType && contentType.includes(expected), 'have content type', opts);
      return this;
    };

    Must.prototype.jsonContent = function() {
      const contentType = this.actual.headers.get('content-type');
      this.assert(contentType && contentType.includes('application/json'), 'have JSON content');
      return this;
    };
  }
}

export default MustHttp;
