import { Inject, Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from '@midwayjs/web';
import { MoreThan, Repository } from 'typeorm';
import { Claim as ClaimEntity, Claim } from '../entity/mysql/Claim';
import { SaveClaimRequest } from '../request/SaveClaimRequest';
import { ArrUtils } from '../util/ArrUtils';
import { ResultVO } from '../vo/ResultVO';
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

  async saveAndVerify(claimReq: SaveClaimRequest) {
    const { ciphertext, senderKeyId, receiverKeyId, nonce, reCaptchaToken } =
      claimReq;

    const ip = this.ctx.request.headers['x-real-ip'];

    // verify
    if (!(await this.reCaptchaService.verify(reCaptchaToken))) {
      this.logger.warn(`verify failed, ip:${ip}`);
      return ResultVO.error('verify failed.');
    }
    const claim = new ClaimEntity();
    claim.ciphertext = ciphertext;
    claim.senderKeyId = senderKeyId;
    claim.receiverKeyId = receiverKeyId;
    claim.nonce = nonce;

    await this.claimRepository.save(claim);
    return ResultVO.success(claim);
  }

  async save(claim: Claim) {
    await this.claimRepository.save(claim);
  }

  async listMessage(
    receiverKeyId: string,
    senderKeyId: string,
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
