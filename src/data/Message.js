export default class Message {
    static Type = {
      IN: 'RECEIVED',
      OUT: 'SENT'
    }
    direction
    data
    timestamp
    name
    savedAs
    constructor(direction, data, nameField) {
      this.direction = direction;
      this.timestamp = new Date().toISOString();
      this.data = JSON.stringify(data, null, 2);
      this.name = data[nameField] ? data[nameField] : data.$argos;
      this.savedAs = null;
    }
  
    setSavedAs(savedAs) {
      this.savedAs = savedAs
      return this
    }
  }
  