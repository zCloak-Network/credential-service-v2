import { IDidDetails } from '@kiltprotocol/types';
import { Rule } from '@midwayjs/decorator';
import { RuleType } from '@midwayjs/decorator/dist/annotation/rule';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

export class SubmitClaimRequest {
  @CreateApiPropertyDoc('received time')
  @Rule(RuleType.number())
  receivedAt: number;

  @CreateApiPropertyDoc('encrypted text')
  @Rule(RuleType.string())
  ciphertext: string;

  @CreateApiPropertyDoc('random salt')
  @Rule(RuleType.string())
  nonce: string;

  @CreateApiPropertyDoc('sender key')
  @Rule(RuleType.string())
  senderKeyId: IDidDetails['uri'];

  @CreateApiPropertyDoc('receiver key')
  @Rule(RuleType.string())
  receiverKeyId: IDidDetails['uri'];

  @CreateApiPropertyDoc('reCaptcha Token')
  @Rule(RuleType.string())
  reCaptchaToken: string;
}
