import axios from 'axios';
import { RequestApiConstant } from '../constant/RequestApiConstant';

type RequestMethod = 'get' | 'post';

export class RequestApi {
  // end with ''
  baseUrl: string;

  constructor(baseUrl: string) {
    if (baseUrl.endsWith('/')) {
      this.baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    } else {
      this.baseUrl = baseUrl;
    }
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  handleData(data: any) {
    return data;
  }

  async request(url: string, method: RequestMethod, params?: any, data?: any) {
    let path = this.baseUrl;
    if (!url.startsWith('/')) {
      path = `${path}/`;
    }
    const headers = this.getHeaders();

    return new Promise((resolve, reject) => {
      axios(`${path}${url}`, {
        method,
        headers,
        params,
        data,
        timeout: RequestApiConstant.DEFAULT_TIMEOUT,
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
