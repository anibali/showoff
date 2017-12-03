import _ from 'lodash';
import axios from 'axios';


class ApiClient {
  constructor(config) {
    this.config = config;
    this.client = axios.create(this.config);
  }

  updateConfig(newConfig) {
    _.merge(this.config, newConfig);
    this.client = axios.create(this.config);
  }

  request(...args) {
    return this.client.request(...args);
  }

  get(...args) {
    return this.client.get(...args);
  }

  delete(...args) {
    return this.client.delete(...args);
  }

  post(...args) {
    return this.client.post(...args);
  }

  put(...args) {
    return this.client.put(...args);
  }

  patch(...args) {
    return this.client.patch(...args);
  }
}


export default new ApiClient({
  baseURL: process.env.IN_BROWSER ? '/api/v2' : 'http://localhost:3000/api/v2'
});
