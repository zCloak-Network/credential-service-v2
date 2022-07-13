import { IDidDetails } from '@kiltprotocol/types';
import { Did } from '@kiltprotocol/sdk-js';

export class KiltUtils {
  static getAddressFromDidUri(didUri: IDidDetails['uri']) {
    const { type, identifier } = Did.Utils.parseDidUri(didUri);
    if (type === 'light') {
      // remove the first two characters
      return identifier.substring(2, identifier.length - 1);
    }
    return identifier;
  }
}
