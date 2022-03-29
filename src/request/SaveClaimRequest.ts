import { Rule } from '@midwayjs/decorator';
import { RuleType } from '@midwayjs/decorator/dist/annotation/rule';

export class SaveClaimRequest {
  @Rule(RuleType.any())
  body: any;
  @Rule(RuleType.number())
  createdAt: number;
  @Rule(RuleType.string())
  receiver: string;
  @Rule(RuleType.string())
  sender: string;
  @Rule(RuleType.string())
  messageId: string;
}


