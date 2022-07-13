import { IDidDetails } from '@kiltprotocol/types';
import { Inject, Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from '@midwayjs/web';
import { MoreThan, Repository } from 'typeorm';

import { Claim } from '../entity/mysql/Claim';
import { SaveClaimRequest } from '../request/SaveClaimRequest';
import { ArrUtils } from '../util/ArrUtils';
import { KiltUtils } from '../util/KiltUtils';
import { ResultVO } from '../vo/ResultVO';
import { MessagePushService } from './MessagePushService';
import { ReCaptchaService } from './ReCaptchaService';

@Provide()
export class MessageService {
  @InjectEntityModel(Claim)
  claimRepository: Repository<Claim>;

  @Inject()
  ctx: Context;

  @Logger()
  logger: ILogger;

  @Inject()
  reCaptchaService: ReCaptchaService;

  @Inject()
  messagePushService: MessagePushService;

  async saveAndVerify(claimReq: SaveClaimRequest) {
    const { ciphertext, senderKeyId, receiverKeyId, nonce, reCaptchaToken } =
      claimReq;

    const ip = this.ctx.request.headers['x-real-ip'];

    // verify
    if (!(await this.reCaptchaService.verify(reCaptchaToken))) {
      this.logger.warn(`verify failed, ip:${ip}`);
      return ResultVO.error('verify failed.');
    }

    const claim = new Claim();
    claim.ciphertext = ciphertext;
    claim.senderKeyId = senderKeyId;
    claim.receiverKeyId = receiverKeyId;
    claim.senderAddress = KiltUtils.getAddressFromDidUri(senderKeyId);
    claim.receiverAddress = KiltUtils.getAddressFromDidUri(receiverKeyId);
    claim.nonce = nonce;

    await this.claimRepository.save(claim);
    await this.messagePushService.sendMessage(claim);

    return ResultVO.success(claim);
  }

  async save(claim: Claim) {
    await this.claimRepository.save(claim);
  }

  async listMessage(
    receiverKeyId: IDidDetails['uri'],
    senderKeyId: IDidDetails['uri'],
    startId: number,
    size: number
  ) {
    const messages = await this.claimRepository.find({
      where: {
        receiverKeyId: receiverKeyId || null,
        senderKeyId: senderKeyId || null,
        id: startId ? MoreThan(startId) : null,
      },
      take: size || 10,
    });

    return ArrUtils.isNotEmpty(messages)
      ? messages.map(item => {
          const { ciphertext, nonce, senderKeyId, receiverKeyId, id } = item;
          return { ciphertext, nonce, senderKeyId, receiverKeyId, id };
        })
      : null;
  }
}
