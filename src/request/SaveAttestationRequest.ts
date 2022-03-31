import { Rule } from '@midwayjs/decorator';
import { RuleType } from '@midwayjs/decorator/dist/annotation/rule'

export class SaveAttestationRequest {
  @Rule(RuleType.string())
  ciphertext: string;
  @Rule(RuleType.number())
  receivedAt: number;
  @Rule(RuleType.string())
  nonce: string;
  @Rule(RuleType.string())
  senderKeyId: string;
  @Rule(RuleType.string())
  receiverKeyId: string;
}


