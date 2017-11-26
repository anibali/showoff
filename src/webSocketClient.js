class WebSocketClient {
  constructor(url, store) {
    this.url = url;
    this.store = store;
    this.ws = null;
    this.attempts = 1;
    this.maxAttempts = 10;
  }

  connect() {
    const ws = new WebSocket(this.url);
    this.ws = ws;

    ws.onopen = () => {
      console.log(`WebSocket connection opened to ${this.url}`);
      this.attempts = 0;
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed', event.code, event.reason);
      this.ws = null;
      if(this.attempts < this.maxAttempts) {
        setTimeout(this.connect.bind(this), 1000);
        this.attempts += 1;
      }
    };

    ws.onmessage = (event) => {
      if(event.data === '') {
        // Keep-alive messages are empty, ignore them
        return;
      }
      const action = JSON.parse(event.data);
      this.store.dispatch(action);
    };
  }
}


export default WebSocketClient;
