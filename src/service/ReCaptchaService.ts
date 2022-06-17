import { Config, Provide } from '@midwayjs/decorator';
import axios from 'axios';
import { isEmpty } from '../util/strUtils';

@Provide()
export class ReCaptchaService {
  @Config('recaptcha')
  reCaptchaConfig: any;

  async verify(token: string) {
    try {
      if (isEmpty(token)) {
        console.log('token is empty.');
        return false;
      }

      console.log('url: ' + this.reCaptchaConfig.host);
      const { data } = await axios({
        url: this.reCaptchaConfig.host,
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `secret=${this.reCaptchaConfig.secretKey}&response=${token}`,
      });

      console.log(`verify result: ${JSON.stringify(data)}`);

      if (data && data.success) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.log('ReCaptchaService error:' + e);
    }
    return true;
  }
}
