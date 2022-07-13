import { EntityModel } from '@midwayjs/orm';
import { Column } from 'typeorm';
import { BaseEntity } from './BaseEntity';

@EntityModel({ name: 'claim' })
export class Claim extends BaseEntity {
  @Column({ name: 'root_hash' })
  rootHash: string;

  @Column({ name: 'ciphertext' })
  ciphertext: string;

  @Column({ name: 'nonce' })
  nonce: string;

  /**
   * alias @kiltprotocol/types/IDidDetails['uri']
   */
  @Column({ name: 'sender_key_id' })
  senderKeyId: string;

  /**
   * alias @kiltprotocol/types/IDidDetails['uri']
   */
  @Column({ name: 'receiver_key_id' })
  receiverKeyId: string;

  @Column({ name: 'sender_address' })
  senderAddress: string;

  @Column({ name: 'receiver_address' })
  receiverAddress: string;

  @Column({ name: 'attested_status' })
  attestedStatus: number;
}
