import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { MoreThan, Repository } from 'typeorm';
import { Claim } from '../entity/mysql/Claim';
import { ArrUtils } from '../util/ArrUtils';

@Provide()
export class MessageService {
  @InjectEntityModel(Claim)
  claimRepository: Repository<Claim>;

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
