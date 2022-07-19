import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { notTransfer } from '../../constant/transferStatus';
import { BaseEntity } from './BaseEntity';

@EntityModel({ name: 'faucet_transfer' })
export class TransferEntity extends BaseEntity {
  @Column({
    name: 'address_from',
    type: 'varchar',
    nullable: false,
    comment: 'sender',
  })
  addressFrom: string;

  @Column({
    name: 'address_to',
    type: 'varchar',
    nullable: false,
    comment: 'receiver',
  })
  addressTo: string;

  @Column({
    name: 'value',
    type: 'varchar',
    nullable: false,
    comment: 'transfer amount',
  })
  value: string;

  @Column({
    name: 'timestamp',
    type: 'timestamp',
    nullable: false,
    comment: 'transaction timestamp',
  })
  timestamp: number;

  @Column({
    name: 'transfer_status',
    default: notTransfer,
    type: 'tinyint',
    nullable: false,
    comment: 'transfer status',
  })
  transferStatus: number;
}
