import { Rule } from '@midwayjs/decorator';
import { RuleType } from '@midwayjs/decorator/dist/annotation/rule';

export class SaveAttesterRequest {
  @Rule(RuleType.string())
  address: string;
  @Rule(RuleType.string())
  did: string;
}
