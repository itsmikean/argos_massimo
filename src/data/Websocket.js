/* eslint-disable  @typescript-eslint/no-this-alias */
import Message from "./Message"

export default class Websocket {
  messages
  environment
  connection
  state
  observables
  constructor(environment) {
    this.messages = []
    this.environment = environment
    this.state = -1
    this.observables = []
  }

  add(observable) {
    if (!observable || !observable.update || !(observable.update instanceof Function)) {
      throw new Error(`observable ${observable} must implement an update method`);
    }
    this.observables.push(observable);
  }

  remove(observable) {
    this.observables = this.observables.filter((ob) => ob !== observable);
  }

  getConnection() {
    return this.connection
  }

  connect() {
    const _this = this;
    return new Promise((resolve, reject) => {
      try {
        _this.connection = new WebSocket(this.environment.url);
      } catch (e) {
        reject(e)
      }

      _this.connection.onopen = function() {
        resolve(_this);
        _this.state = 1;
      };
      _this.connection.onmessage = function(ev) {
        _this.messages.unshift(new Message(Message.Type.IN, JSON.parse(ev.data), _this.environment.field));
        _this.updateObservables();
      };
      _this.connection.onclose = function() {
        _this.connection = null;
        _this.state = 4;
        reject(null);
      };
      _this.connection.onerror = function(err) {
        reject(err);
      };
    });
  }

  disconnect() {
    this.connection.close(1000, 'Bye')
  }

  sendMessage(msg) {
    if (this.connection) {
      this.connection.send(JSON.stringify(msg));
      this.messages.unshift(new Message(Message.Type.OUT, msg, this.environment.field));
    }
  }

  clearMessages() {
    this.messages = []
  }

  updateObservables() {
    this.observables.forEach((observable) => {
      observable.update(this);
    });
  }
}
