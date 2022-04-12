import { Claim } from '../entity/Claim';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Provide } from '@midwayjs/decorator';
import { AttestationStatus } from '../constant/attestationStatus';

@Provide()
export class ClaimService {
  @InjectEntityModel(Claim)
  claimModel: ReturnModelType<typeof Claim>;

  async updateAttestationStatusById(
    id: any,
    attestationStatus: AttestationStatus
  ) {
    await this.claimModel.findByIdAndUpdate(id, { attestationStatus });
  }

  async getBySenderKeyId(senderKeyId: string) {
    return await this.claimModel.findOne({ senderKeyId }).exec();
  }

  async getByReceiverKeyId(receiverKeyId: string) {
    return await this.claimModel.find({ receiverKeyId }).exec();
  }

  async save(claim: Claim) {
    return await this.claimModel.create(claim);
  }
}
