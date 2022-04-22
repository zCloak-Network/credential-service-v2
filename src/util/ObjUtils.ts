export class ObjUtils {
  static isNotNull<O>(o: O) {
    return !ObjUtils.isNull(o);
  }

  static isNull<O>(o: O) {
    return o === undefined || o === null;
  }
}
