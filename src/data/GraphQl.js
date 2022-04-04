import request from 'request'

export class GraphQl {

  async query(url, query, headers) {
    return new Promise(function(resolve, reject) {
      request({
        url: url,
        method: 'POST',
        body: JSON.stringify({query: query}),
        headers: headers
      }, (err, response, body) => {
        if (err) {
          reject(err)
        }

        if (response.statusCode !== 200) {
          reject({status: response.statusCode, message: response.statusMessage})
        }

        const parsedBody = JSON.parse(body);

        if (parsedBody.errors) {
          reject({status: response.statusCode, errors: parsedBody.errors})
        }

        resolve({body: JSON.parse(body)})
      })
    });
  }
}

export const graphQl = new GraphQl()
