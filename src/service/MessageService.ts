import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { MoreThanOrEqual, Repository } from 'typeorm';
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
    idGe: number,
    count: number
  ) {
    const messages = await this.claimRepository.find({
      where: {
        receiverKeyId: receiverKeyId || null,
        senderKeyId: senderKeyId || null,
        id: idGe ? MoreThanOrEqual(idGe) : null,
      },
      take: count ?? null,
    });

    return ArrUtils.isNotEmpty(messages)
      ? messages.map(item => {
          const { ciphertext, nonce, senderKeyId, receiverKeyId, id } = item;
          return { ciphertext, nonce, senderKeyId, receiverKeyId, id };
        })
      : null;
  }
}
