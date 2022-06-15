import { ObjUtils } from './ObjUtils';

export class ArrUtils {
  static isNotEmpty<T>(arr: T[]) {
    return ObjUtils.isNotNull(arr) && arr.length > 0;
  }

  static isEmpty<T>(arr: T[]) {
    return !ArrUtils.isNotEmpty(arr);
  }
}
