export default class Environment {
    static Type = {
      WEB_SOCKET: 'websocket',
      GQL: 'gql'
    }
    name
    url
    field
    id
    type
    variables
    environmentType
    constructor(name, url, field, type, environmentType) {
      this.name = name
      this.url = url;
      this.field = field;
      this.id = Date.now();
      this.type = type;
      this.variables = "{\"foo\":\"bar\"}";
      // default to websocket for back compatibility
      this.environmentType = environmentType || Environment.Type.WEB_SOCKET;
    }

    /**
     * Matches a query string against either the name or the url of this environment
     * 
     * @param {string} query a text string to match with either the name or the url
     * @returns <code>true</code> when the query matches either the url or the name
     * <code>false</code> otherwise
     */
    matches(query) {
      const matchesName = this.name.indexOf(query) !== -1;
      const matchesUrl = this.url.indexOf(query) !== -1;
      return matchesName || matchesUrl
    }

    static environmentTypeLabel(envType) {
      if (envType === Environment.Type.WEB_SOCKET) {
        return 'WebSocket';
      }
      return 'GraphQl';
    }
  }
  