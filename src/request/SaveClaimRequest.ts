import { IDidDetails } from '@kiltprotocol/types';
import { Rule } from '@midwayjs/decorator';
import { RuleType } from '@midwayjs/decorator/dist/annotation/rule';

export class SaveClaimRequest {
  @Rule(RuleType.number())
  receivedAt: number;

  @Rule(RuleType.string())
  ciphertext: string;

  @Rule(RuleType.string())
  nonce: string;

  @Rule(RuleType.string())
  senderKeyId: IDidDetails['uri'];

  @Rule(RuleType.string())
  receiverKeyId: IDidDetails['uri'];

  @Rule(RuleType.string())
  reCaptchaToken: string;
}
