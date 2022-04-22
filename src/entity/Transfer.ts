import { EntityModel } from '@midwayjs/typegoose';
import { modelOptions, prop } from '@typegoose/typegoose';
import { notTransfer, TransferStatus } from '../constant/transferStatus';

@EntityModel()
@modelOptions({ schemaOptions: { collection: 'transfers' } })
export class Transfer {
  @prop({ required: true })
  addressFrom: string;

  @prop({ required: true })
  addressTo: string;

  @prop({ required: true })
  value: string;

  @prop({ required: true })
  timestamp: number;

  @prop({ required: true, default: notTransfer })
  transferStatus: TransferStatus;
}
