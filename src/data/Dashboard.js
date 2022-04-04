export default class Dashboard {
    environment
    connection
    name
    context
    constructor(environment, connection, name) {
      this.name = name;
      this.environment = environment;
      this.connection = connection;
      this.context = {};
    }
  }
  