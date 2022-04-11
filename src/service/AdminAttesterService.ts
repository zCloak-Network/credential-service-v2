import { Config, Init, Inject, Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { ClaimService } from './ClaimService';
import { SubmitClaimRequest } from '../request/SubmitClaimRequest';
import * as Kilt from '@kiltprotocol/sdk-js';
import { MessageBody, NaclBoxCapable } from '@kiltprotocol/types';
import { generateAccount, generateFullKeypairs, getFullDid } from '../util/accountUtils';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { AttestationService } from './AttestationService';
import { Attestation } from '../entity/Attestation';
import { Claim } from '../entity/Claim'

@Provide()
export class AdminAttesterService {
  @Config('adminAttester.mnemonic')
  mnemonic: string;

  @Config('adminAttester.address')
  address: string;

  @Config('adminAttester.didUri')
  didUri: string;

  @Config('adminAttester.wssAddress')
  wssAddress: string;

  @Inject()
  claimService: ClaimService;

  @Inject()
  attestationService: AttestationService;

  @Logger()
  logger: ILogger;

  @Init()
  async init() {
    await cryptoWaitReady();
    await Kilt.init({ address: this.wssAddress });

    this.logger.info('kilt init successful');
  }

  async submitClaim(submitClaimRequest: SubmitClaimRequest) {
    // step 1: save claim
    this.logger.debug('save claim to db');
    await this.claimService.save(submitClaimRequest as Claim);

    const keystore = new Kilt.Did.DemoKeystore();
    await generateFullKeypairs(keystore, this.mnemonic);
    const fullDid = await getFullDid(this.address);

    // step 2: decrypt claim
    this.logger.debug('decrypt message');
    const message = await this.decryptMessage(submitClaimRequest, fullDid, keystore);

    // step 3: submit attestation to chain
    const request = (message.body.content as any).requestForAttestation;
    const attestation = Kilt.Attestation.fromRequestAndDid(
      request,
      this.didUri
    );

    this.submitAttestationToChain(attestation, fullDid, keystore).then(() => {
      const messageBody = {
        content: {
          attestation: { ...attestation },
          request: request,
        },
        type: Kilt.Message.BodyType.SUBMIT_ATTESTATION,
      };

      const receiver = Kilt.Did.LightDidDetails.fromUri(message.sender);

      const messageBack = new Kilt.Message(
        messageBody as MessageBody,
        this.didUri,
        message.sender
      );

      messageBack
        .encrypt(
          fullDid.encryptionKey!.id,
          fullDid,
          keystore,
          receiver.assembleKeyId(receiver.encryptionKey!.id)
        )
        .then((message) => {
          // save attestation
          this.logger.debug('save attestation');
          this.attestationService.save(message as Attestation);
        });
    });
  }

  private async submitAttestationToChain(
    attestation: Kilt.Attestation,
    fullDid: Kilt.Did.FullDidDetails,
    keystore: NaclBoxCapable
  ) {
    this.logger.debug('submit attestation to chain');

    const account = await generateAccount(this.mnemonic);

    const tx = await attestation.getStoreTx();
    const extrinsic = await fullDid.authorizeExtrinsic(
      tx,
      keystore,
      account.address
    );

    // submit attestation to chain
    await Kilt.BlockchainUtils.signAndSubmitTx(extrinsic, account, {
      resolveOn: Kilt.BlockchainUtils.IS_FINALIZED,
      reSign: true,
    });
  }

  private async decryptMessage(
    submitClaimRequest: SubmitClaimRequest,
    fullDid: Kilt.Did.FullDidDetails,
    keystore: NaclBoxCapable
  ) {
    return await Kilt.Message.decrypt(
      submitClaimRequest,
      keystore,
      fullDid
    );
  }
}
