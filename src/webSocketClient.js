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
      const action = JSON.parse(event.data);
      this.store.dispatch(action);
    };
  }
}


export default WebSocketClient;
