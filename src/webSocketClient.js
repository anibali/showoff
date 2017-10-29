const notebookActionCreators = require('./redux/notebooksActionCreators');


class WebSocketClient {
  constructor(url, store) {
    this.url = url;
    this.store = store;
    this.ws = null;
  }

  connect() {
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      console.log('WebSocket connection opened');
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      this.ws = null;
    };

    ws.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data));
    };
  }

  handleMessage(data) {
    const action = notebookActionCreators.modifyFrame(data);
    this.store.dispatch(action);
  }
}


module.exports = WebSocketClient;
