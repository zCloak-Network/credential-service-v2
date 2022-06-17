import * as Kilt from '@kiltprotocol/sdk-js';
import { MessageBody, NaclBoxCapable } from '@kiltprotocol/types';
import { Config, Init, Inject, Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel } from '@midwayjs/orm';
import { Context } from '@midwayjs/web';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Repository } from 'typeorm';
import { AppConstant } from '../constant/AppConstant';
import {
  notSubmit,
  submitFailure,
  submitSuccess,
  submitting,
} from '../constant/attestationStatus';
import { Attestation } from '../entity/Attestation';
import { Claim } from '../entity/Claim';
import { Claim as ClaimEntity } from '../entity/mysql/Claim';
import { ClaimQueue } from '../queue/impl/ClaimQueue';
import { IQueueClient } from '../queue/IQueueClient';
import { SubmitClaimRequest } from '../request/SubmitClaimRequest';
import {
  generateAccount,
  generateFullKeypairs,
  getFullDid,
} from '../util/accountUtils';
import { DateUtils } from '../util/DateUtils';
import { ObjUtils } from '../util/ObjUtils';
import { AttestationService } from './AttestationService';
import { ClaimService } from './ClaimService';
import { convertInstance } from '../util';

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

  @InjectEntityModel(ClaimEntity)
  claimRepository: Repository<ClaimEntity>;

  @Inject('claimQueueClient')
  claimQueueClient: IQueueClient<ClaimQueue>;

  @Inject()
  ctx: Context;

  @Init()
  async init() {
    await cryptoWaitReady();
    await Kilt.init({ address: this.wssAddress });
  }

  async submitClaimToQueue(submitClaimRequest: SubmitClaimRequest) {
    const ip = this.ctx.request.headers['x-real-ip'];
    if (ip === '47.243.120.137' || ip === '60.157.127.89') {
      this.logger.info(`illegal  x-real-ip > ${ip}`);
      return;
    }

    this.logger.info(`submitClaimToQueue  x-real-ip > ${ip}`);

    const keystore = new Kilt.Did.DemoKeystore();
    await generateFullKeypairs(keystore, this.mnemonic);

    const fullDid = await getFullDid(this.address);
    const message = await this.decryptMessage(
      submitClaimRequest,
      fullDid,
      keystore
    );

    const request = (message.body.content as any).requestForAttestation;

    const claim = new ClaimEntity();
    claim.rootHash = request.rootHash;
    claim.nonce = submitClaimRequest.nonce;
    claim.senderKeyId = submitClaimRequest.senderKeyId;
    claim.receiverKeyId = submitClaimRequest.receiverKeyId;
    claim.ciphertext = submitClaimRequest.ciphertext;
    // TODO: update attested status
    claim.attestedStatus = 1;
    claim.createTime = DateUtils.getUTCDate();
    claim.updateTime = DateUtils.getUTCDate();

    // push to db
    await this.claimRepository.save(claim);

    const entity = new ClaimQueue();
    entity.rootHash = request.rootHash;
    entity.deleteFlag = AppConstant.IS_NOT_DELETE;
    entity.createTime = DateUtils.getUTCDate();
    entity.updateTime = DateUtils.getUTCDate();

    // push ot queue
    await this.claimQueueClient.add(entity);
  }

  async submitClaim(submitClaimRequest: SubmitClaimRequest) {
    const ip = this.ctx.request.headers['x-real-ip'];
    if (ip === '47.243.120.137' || ip === '60.157.127.89') {
      this.logger.info(`illegal  x-real-ip > ${ip}`);
      return;
    }

    const logPrefix = `submit attestation x-real-ip [${ip}] >`;
    this.logger.debug(`${logPrefix} start`);

    // step 1: save claim
    this.logger.debug(`${logPrefix} save claim to db`);
    // const claim = submitClaimRequest as Claim;
    const claim = convertInstance(submitClaimRequest, Claim);

    claim.attestationStatus = submitting;
    const claimModel = await this.claimService.save(claim);

    const claimId = claimModel._id;

    const keystore = new Kilt.Did.DemoKeystore();
    await generateFullKeypairs(keystore, this.mnemonic);

    this.logger.debug(`${logPrefix} get full did`);
    const fullDid = await getFullDid(this.address);

    // step 2: decrypt claim
    this.logger.debug(`${logPrefix} decrypt claim message`);
    const message = await this.decryptMessage(
      submitClaimRequest,
      fullDid,
      keystore
    );

    // step 3: submit attestation to chain
    const request = (message.body.content as any).requestForAttestation;
    const attestation = Kilt.Attestation.fromRequestAndDid(
      request,
      this.didUri
    );

    this.submitAttestationToChain(attestation, fullDid, keystore, logPrefix)
      .then(async () => {
        const messageBody = {
          content: {
            attestation: { ...attestation },
            request: request,
          },
          type: Kilt.Message.BodyType.SUBMIT_ATTESTATION,
        };

        const receiver = Kilt.Did.LightDidDetails.fromUri(message.sender);

        const attestationMessage = new Kilt.Message(
          messageBody as MessageBody,
          this.didUri,
          message.sender
        );

        this.logger.debug(`${logPrefix} encrypt attestation message`);
        const encryptMessage = await attestationMessage.encrypt(
          fullDid.encryptionKey!.id,
          fullDid,
          keystore,
          receiver.assembleKeyId(receiver.encryptionKey!.id)
        );

        // save attestation
        this.logger.debug(`${logPrefix} save attestation to db`);
        await this.attestationService.save(encryptMessage as Attestation);

        // submit success
        await this.claimService.updateAttestationStatusById(
          claimId,
          submitSuccess
        );

        this.logger.debug(`${logPrefix} save attestation to db end`);
      })
      .catch(err => {
        // error
        this.logger.warn(
          `submit attestation > failure\n${JSON.stringify(err)}`
        );

        this.claimService.updateAttestationStatusById(claimId, submitFailure);
      });
  }

  private async submitAttestationToChain(
    attestation: Kilt.Attestation,
    fullDid: Kilt.Did.FullDidDetails,
    keystore: NaclBoxCapable,
    logPrefix: string
  ) {
    const startTime = Date.now();

    const account = await generateAccount(this.mnemonic);

    this.logger.debug(`${logPrefix} authorize extrinsic tx`);
    const tx = await attestation.getStoreTx();
    const extrinsic = await fullDid.authorizeExtrinsic(
      tx,
      keystore,
      account.address
    );

    // submit attestation to chain
    this.logger.debug(`${logPrefix} submit attestation to chain`);
    const result = await Kilt.BlockchainUtils.signAndSubmitTx(
      extrinsic,
      account,
      {
        resolveOn: Kilt.BlockchainUtils.IS_FINALIZED,
        reSign: true,
      }
    );

    const endTime = Date.now();

    this.logger.debug(
      `${logPrefix} submit success, cost time ${
        endTime - startTime
      }(ms)\n${JSON.stringify(result)}`
    );
  }

  private async decryptMessage(
    submitClaimRequest: SubmitClaimRequest,
    fullDid: Kilt.Did.FullDidDetails,
    keystore: NaclBoxCapable
  ) {
    return await Kilt.Message.decrypt(submitClaimRequest, keystore, fullDid);
  }

  async getAttestationStatusBySenderKeyId(senderKeyId: string) {
    const claim = await this.claimService.getBySenderKeyId(senderKeyId);
    return claim && claim.attestationStatus
      ? claim.attestationStatus
      : notSubmit;
  }

  async getClaimAttestedStatus(rootHash: string) {
    const defaultStatus = { status: 0 };

    const claim = await this.claimRepository.findOneBy({ rootHash });

    if (ObjUtils.isNull(claim)) {
      return defaultStatus;
    }

    // TODO: update attested status
    // search position in queue
    if (claim.attestedStatus === 1) {
      const position = await this.claimQueueClient.getPosition(rootHash);
      return {
        status: 1,
        position,
      };
    }

    return { status: claim.attestedStatus };
  }

  async submitClaimSync(submitClaimRequest: SubmitClaimRequest) {
    this.logger.debug(`submit attestation > start`);

    const keystore = new Kilt.Did.DemoKeystore();
    await generateFullKeypairs(keystore, this.mnemonic);

    this.logger.debug(`submit attestation > get full did`);
    const fullDid = await getFullDid(this.address);

    this.logger.debug(`submit attestation > decrypt claim message`);
    const message = await this.decryptMessage(
      submitClaimRequest,
      fullDid,
      keystore
    );

    const userDid = Kilt.Did.LightDidDetails.fromUri(message.sender);
    const userAddress = userDid.identifier;

    const logPrefix = `submit attestation [user address: ${userAddress}] >`;

    const request = (message.body.content as any).requestForAttestation;
    const attestation = Kilt.Attestation.fromRequestAndDid(
      request,
      this.didUri
    );

    const claimHash = request.rootHash;

    const account = await generateAccount(this.mnemonic);

    let successFlag = true;

    try {
      const startTime = Date.now();
      this.logger.debug(`${logPrefix} authorize extrinsic tx`);
      const tx = await attestation.getStoreTx();
      const extrinsic = await fullDid.authorizeExtrinsic(
        tx,
        keystore,
        account.address
      );

      // submit attestation to chain
      this.logger.debug(`${logPrefix} start submit attestation to chain`);
      const result = await Kilt.BlockchainUtils.signAndSubmitTx(
        extrinsic,
        account,
        {
          resolveOn: Kilt.BlockchainUtils.IS_FINALIZED,
          reSign: true,
        }
      );

      const endTime = Date.now();

      this.logger.debug(
        `${logPrefix} submit success, cost time ${
          endTime - startTime
        }(ms)\n${JSON.stringify(result)}`
      );
    } catch (err) {
      // error
      this.logger.warn(`${logPrefix} failure\n${JSON.stringify(err)}`);

      const attestation = await Kilt.Attestation.query(claimHash);
      if (ObjUtils.isNotNull(attestation)) {
        this.logger.debug(
          `${logPrefix} retry query in kilt chain then find the attestation is existed`
        );
      } else {
        successFlag = false;
        // TODO: update attested status
        await this.updateClaimStatus(claimHash, -1);
      }
    }

    // error exit
    if (!successFlag) {
      return successFlag;
    }

    const messageBody = {
      content: {
        attestation: { ...attestation },
        request: request,
      },
      type: Kilt.Message.BodyType.SUBMIT_ATTESTATION,
    };

    const attestationMessage = new Kilt.Message(
      messageBody as MessageBody,
      this.didUri,
      message.sender
    );

    this.logger.debug(`${logPrefix} encrypt attestation message`);
    const encryptMessage = await attestationMessage.encrypt(
      fullDid.encryptionKey!.id,
      fullDid,
      keystore,
      userDid.assembleKeyId(userDid.encryptionKey!.id)
    );

    // save attestation
    this.logger.debug(`${logPrefix} save attestation to db`);
    await this.attestationService.save(encryptMessage as Attestation);

    // submit success
    // TODO: update attested status
    await this.updateClaimStatus(claimHash, 2);

    this.logger.debug(`${logPrefix} end`);

    return true;
  }

  private async updateClaimStatus(claimHash: string, attestedStatus: number) {
    await this.claimRepository.update(
      {
        rootHash: claimHash,
      },
      {
        attestedStatus,
      }
    );
  }

  async getClaimByRootHash(rootHash: string) {
    return await this.claimRepository.findOneBy({
      rootHash,
    });
  }
}
