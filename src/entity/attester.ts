import { EntityModel } from '@midwayjs/typegoose'
import { modelOptions, prop } from '@typegoose/typegoose'

@EntityModel()
@modelOptions({ schemaOptions: { collection: 'attesters' } })
export class Attester {
  @prop()
  address: string;
  @prop()
  did: string;
}
