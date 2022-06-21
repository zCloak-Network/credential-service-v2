export class CommonUtils {
  static sleep(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
