import { Provide } from '@midwayjs/decorator';
import { Attestation } from '../entity/Attestation';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectEntityModel } from '@midwayjs/typegoose';

@Provide()
export class AttestationService {
  @InjectEntityModel(Attestation)
  attestationModel: ReturnModelType<typeof Attestation>;

  async save(attestation: Attestation) {
    await this.attestationModel.create(attestation);
  }

  async getByReceiverKeyId(receiverKeyId: string) {
    return await this.attestationModel.find({ receiverKeyId }).exec();
  }
}
