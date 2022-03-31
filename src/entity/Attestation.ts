import { EntityModel } from '@midwayjs/typegoose'
import { modelOptions, prop } from '@typegoose/typegoose'

@EntityModel()
@modelOptions({ schemaOptions: { collection: 'attestations' } })
export class Attestation {
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
}
