import { EntityModel } from '@midwayjs/typegoose';
import { modelOptions, prop } from '@typegoose/typegoose';

@EntityModel()
@modelOptions({ schemaOptions: { collection: 'messages' } })
export class Claim {
  @prop()
  body: any;
  @prop()
  createdAt: number;
  @prop()
  receiver: string;
  @prop()
  sender: string;
  @prop()
  messageId: string;
}
