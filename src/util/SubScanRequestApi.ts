import { RequestApi } from './RequestApi';

export class SubScanRequestApi extends RequestApi {
  tokenIndex = 0;

  tokens: string[];

  constructor(baseUrl: string, tokens: string[]) {
    super(baseUrl);
    this.tokens = tokens;
  }

  getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      'X-API-Key': token,
    };
  }

  getToken() {
    const currentToken = this.tokens[this.tokenIndex];
    if (++this.tokenIndex >= this.tokens.length) {
      this.tokenIndex = 0;
    }

    return currentToken;
  }

  handleData(data: any) {
    if (data.code === 0) {
      return data.data;
    }
    throw Error(`response error, code ${data.code}`);
  }
}
