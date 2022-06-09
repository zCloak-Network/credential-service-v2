import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { ObjUtils } from './ObjUtils';

// use utc time
dayjs.extend(utc);

export class DateUtils {
  static DEFAULT_FORMAT_STR = 'YYYY-MM-DD HH:mm:ss Z';

  static getUTCDate() {
    return dayjs().toDate();
  }

  static formatTimestampToStr(timestamp: number) {
    if (ObjUtils.isNotNull(timestamp)) {
      return dayjs(timestamp).format(DateUtils.DEFAULT_FORMAT_STR);
    }
    return null;
  }
}
