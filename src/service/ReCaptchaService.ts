import { Config, Logger, Provide } from '@midwayjs/decorator';
import axios from 'axios';
import { isEmpty } from '../util/strUtils';
import { ILogger } from '@midwayjs/logger';

@Provide()
export class ReCaptchaService {
  @Config('recaptcha')
  reCaptchaConfig: any;

  @Logger()
  logger: ILogger;

  async verify(token: string) {
    try {
      if (isEmpty(token)) {
        this.logger.info('Token is Empty.');
        return false;
      }

      // this.logger.info('url: ' + this.reCaptchaConfig.host);
      const { data } = await axios({
        url: this.reCaptchaConfig.host,
        method: 'post',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: `secret=${this.reCaptchaConfig.secretKey}&response=${token}`,
      });

      // this.logger.info(`reCaptcha Verify Result: ${JSON.stringify(data)}`);

      if (data && data.success) {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      this.logger.info('ReCaptchaService error:' + e);
    }
    return false;
  }
}
