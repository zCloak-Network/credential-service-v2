import { EntityModel } from '@midwayjs/orm';
import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@EntityModel({ name: 'ctype' })
export class CTypeEntity {
  @Column({
    name: 'metadata',
    type: 'json',
    nullable: false,
    comment: 'the metadata of ctype',
  })
  metadata: IMetadata;

  @Column({
    name: 'ctype_hash',
    type: 'varchar',
    nullable: false,
    comment: 'the hash of ctype',
  })
  ctypeHash: string;

  @Column({
    name: 'owner',
    type: 'varchar',
    nullable: false,
    comment: 'owner address',
  })
  owner: string;

  // adapt zkID-service==
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;
  // adapt zkID-service==
}

interface IMetadata {
  title: string;
  owner: string;
  description?: IMultilangLabel;
  properties: IMetadataProperties;
}

declare type IMetadataProperties = {
  [key: string]: IMultilangLabel;
};

interface IMultilangLabel {
  default: string;

  [key: string]: string;
}
