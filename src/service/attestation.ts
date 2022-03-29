import { Provide } from '@midwayjs/decorator';
import { Attestation } from '../entity/attestation';
import { ReturnModelType } from '@typegoose/typegoose';
import { InjectEntityModel } from '@midwayjs/typegoose';

@Provide()
export class AttestationService {
  @InjectEntityModel(Attestation)
  attestationModel: ReturnModelType<typeof Attestation>;

  async save(attestation: Attestation) {
    await this.attestationModel.create(attestation);
  }

  async getByReceiver(receiver: string) {
    return await this.attestationModel.find({ receiver }).exec();
  }
}