import axios from 'axios';

type RequestMethod = 'get' | 'post';

export class RequestApi {
  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  handleData(data: any) {
    return data;
  }

  async request(url: string, method: RequestMethod, params?: any, data?: any) {
    const headers = this.getHeaders();
    return new Promise((resolve, reject) => {
      axios(url, {
        method,
        headers,
        params,
        data,
        timeout: 3000,
      })
        .then(res => {
          return res.data;
        })
        .then(data => {
          return this.handleData(data);
        })
        .then(resolve)
        .catch(err => {
          console.log(JSON.stringify(err));
          reject(err);
        });
    });
  }

  async get(url: string, params?: any) {
    return await this.request(url, 'get', params);
  }

  async post(url: string, params?: any, data?: any) {
    return await this.request(url, 'post', params, data);
  }
}
