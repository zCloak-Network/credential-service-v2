import { Provide } from '@midwayjs/decorator';
import { Attestation } from '../entity/Attestation';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { isEmpty } from '../util/strUtils';

@Provide()
export class AttestationService {
  @InjectEntityModel(Attestation)
  attestationModel: ReturnModelType<typeof Attestation>;

  async save(attestation: Attestation) {
    await this.attestationModel.create(attestation);
  }

  async getByReceiverKeyIdAndSenderKeyId(receiverKeyId: string, senderKeyId: string) {
    const queryObj: any = {};
    if (!isEmpty(receiverKeyId)) {
      queryObj.receiverKeyId = receiverKeyId;
    }
    if (!isEmpty(senderKeyId)) {
      queryObj.senderKeyId = senderKeyId;
    }
    return await this.attestationModel.find({ queryObj }).exec();
  }
}
