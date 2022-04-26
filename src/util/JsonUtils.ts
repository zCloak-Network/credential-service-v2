import { ObjUtils } from './ObjUtils';

export class JsonUtils {
  static toUnicode(arg: any) {
    if (ObjUtils.isNotNull(arg)) {
      let result = '';
      let character;
      for (let i = 0; i < arg.length; i++) {
        character = arg.charCodeAt(i).toString(16);
        switch (character.length) {
          case 1:
            character = '000' + character;
            break;
          case 2:
            character = '00' + character;
            break;
          case 3:
            character = '0' + character;
            break;
        }
        result += '\\u' + character;
      }
      return result;
    }
    return null;
  }
}
