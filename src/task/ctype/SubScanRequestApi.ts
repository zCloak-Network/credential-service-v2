import { RequestApi } from '../../util/RequestApi';
import { SubScanTokenGetter } from './SubScanTokenGetter';

export class SubScanRequestApi extends RequestApi {
  subScanTokenGetter: any;

  constructor(subScanTokens: string[]) {
    super();
    this.subScanTokenGetter = new SubScanTokenGetter(subScanTokens);
  }

  getHeaders() {
    const token = this.subScanTokenGetter.getToken();
    return {
      'Content-Type': 'application/json',
      'X-API-Key': token,
    };
  }

  handleData(data: any) {
    if (data.code === 0) {
      return data.data;
    }
    throw Error(`response error, code ${data.code}`);
  }
}
