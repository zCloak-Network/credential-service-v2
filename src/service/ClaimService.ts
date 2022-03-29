import { Claim } from '../entity/Claim';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Provide } from '@midwayjs/decorator';

@Provide()
export class ClaimService {
  @InjectEntityModel(Claim)
  claimModel: ReturnModelType<typeof Claim>;

  async getByReceiver(receiver: string) {
    return await this.claimModel.find({ receiver }).exec();
  }

  async save(claim: Claim) {
    await this.claimModel.create(claim);
  }
}