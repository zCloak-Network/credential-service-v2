import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@EntityModel({ name: 'row_scan_ctype' })
export class RowScanCTypeEntity extends BaseEntity {
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
}

interface IMetadata {
  title: string;
  owner: string;
  description?: IMultilangLabel;
  properties: IMetadataProperties;
}

type IMetadataProperties = {
  [key: string]: IMultilangLabel;
};

interface IMultilangLabel {
  default: string;

  [key: string]: string;
}
