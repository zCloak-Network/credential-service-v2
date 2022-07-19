import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@EntityModel({ name: 'claim' })
export class ClaimEntity extends BaseEntity {
  @Column({
    name: 'ciphertext',
    type: 'varchar',
    nullable: false,
    comment: 'message body',
  })
  ciphertext: string;

  @Column({
    name: 'nonce',
    type: 'varchar',
    nullable: false,
    comment: 'encryption and decryption nonce',
  })
  nonce: string;

  /**
   * alias @kiltprotocol/types/IDidDetails['uri']
   */
  @Column({
    name: 'sender_key_id',
    type: 'varchar',
    nullable: false,
    comment: 'the kilt uri of sender',
  })
  senderKeyId: string;

  /**
   * alias @kiltprotocol/types/IDidDetails['uri']
   */
  @Column({
    name: 'receiver_key_id',
    type: 'varchar',
    nullable: false,
    comment: 'the kilt uri of receiver',
  })
  receiverKeyId: string;

  @Column({
    name: 'root_hash',
    type: 'varchar',
    nullable: true,
    comment: 'the root hash of message',
  })
  rootHash: string;

  @Column({
    name: 'sender_address',
    type: 'varchar',
    nullable: false,
    comment: 'the address of sender',
  })
  senderAddress: string;

  @Column({
    name: 'receiver_address',
    type: 'varchar',
    nullable: false,
    comment: 'the address of receiver',
  })
  receiverAddress: string;

  @Column({
    name: 'attested_status',
    type: 'tinyint',
    nullable: true,
    comment: 'the attested status of claim',
  })
  attestedStatus: number;
}
