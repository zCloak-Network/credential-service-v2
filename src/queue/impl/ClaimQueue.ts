import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from '../../entity/mysql/BaseEntity';

@EntityModel({name: 'claim_queue'})
export class ClaimQueue extends BaseEntity{
  @Column({name: 'root_hash'})
  rootHash: string;

  @Column({name: 'is_delete'})
  deleteFlag: number;
}
