const responsify = (obj) => {
  if(obj instanceof Error && obj.response != null) {
    return obj.response;
  }
  return obj;
};

class MustHttp {
  static register(Must) {
    Must.prototype.errorResponse = function(expectedStatus, expectedMessage) {
      const { data, status } = responsify(this.actual);
      if(expectedStatus != null) {
        this.actual = status;
        this.assert(
          status === expectedStatus,
          'be status',
          { actual: status, expected: expectedStatus }
        );
      }
      this.actual = data;
      this.assert(
        typeof data.error === 'string',
        'have "error" field with string value',
        { actual: data }
      );
      if(expectedMessage != null) {
        this.actual = data;
        this.assert(
          data.error === expectedMessage, 'have error message',
          { actual: data, expected: expectedMessage }
        );
      }
      return this;
    };

    Must.prototype.status = function(expected) {
      const { status } = responsify(this.actual);
      const opts = { actual: status, expected };
      this.assert(status === expected, 'have status', opts);
      return this;
    };

    Must.prototype.contentType = function(expected) {
      const contentType = responsify(this.actual).headers['content-type'];
      const opts = { actual: contentType, expected };
      this.assert(contentType && contentType.includes(expected), 'have content type', opts);
      return this;
    };

    Must.prototype.jsonContent = function() {
      const contentType = responsify(this.actual).headers['content-type'];
      this.assert(contentType && contentType.includes('application/json'), 'have JSON content');
      return this;
    };
  }
}

export default MustHttp;
