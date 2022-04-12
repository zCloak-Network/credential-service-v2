import { EntityModel } from '@midwayjs/typegoose';
import { modelOptions, prop } from '@typegoose/typegoose';
import { defaultStatus } from '../constant/attestationStatus';

@EntityModel()
@modelOptions({ schemaOptions: { collection: 'messages' } })
export class Claim {
  @prop()
  receivedAt: number;

  @prop()
  ciphertext: string;

  @prop()
  nonce: string;

  @prop()
  senderKeyId: string;

  @prop()
  receiverKeyId: string;

  /**
   * attestation status
   * using for admin attester's attestation
   */
  @prop({ default: defaultStatus })
  attestationStatus: number;
}
