import { Application } from 'egg';
import { ClaimQueue } from '../../queue/impl/ClaimQueue';
import { IQueueClient } from '../../queue/IQueueClient';
import { SubmitClaimRequest } from '../../request/SubmitClaimRequest';
import { AdminAttesterService } from '../../service/AdminAttesterService';
import { CommonUtils } from '../../util/CommonUtils';
import { ObjUtils } from '../../util/ObjUtils';
import { AppInitializer } from '../AppInitializer';

export class SubmitAttestationTaskInitializer implements AppInitializer {
  async doInit(app: Application): Promise<void> {
    const logPrefix = `SubmitAttestationTask >`;

    const logger = app.getLogger();
    const claimQueueClient = await app
      .getApplicationContext()
      .getAsync<IQueueClient<ClaimQueue>>('claimQueueClient');
    const adminAttesterService = await app
      .getApplicationContext()
      .getAsync<AdminAttesterService>(AdminAttesterService);
    // start task
    new Promise(async resolve => {
      logger.info(`${logPrefix} start attestation queue submit task`);

      for (;;) {
        let job = null;

        try {
          job = await claimQueueClient.peek();
        } catch (err) {
          logger.warn(`${logPrefix} poll claim error\n${JSON.stringify(err)}`);
        }

        if (ObjUtils.isNotNull(job)) {
          let claim = null;
          const rootHash = job.rootHash;

          try {
            claim = await adminAttesterService.getClaimByRootHash(rootHash);
          } catch (err) {
            logger.warn(
              `${logPrefix} get claim by rootHash error ${rootHash}\n${JSON.stringify(
                err
              )}`
            );
          }

          if (ObjUtils.isNotNull(claim)) {
            const claimRequest = new SubmitClaimRequest();
            claimRequest.ciphertext = claim.ciphertext;
            claimRequest.nonce = claim.nonce;
            claimRequest.senderKeyId = claim.senderKeyId;
            claimRequest.receiverKeyId = claim.receiverKeyId;

            try {
              await adminAttesterService.submitClaimSync(claimRequest);
            } catch (err) {
              logger.error(`${logPrefix} error\n${JSON.stringify(err)}`);
            } finally {
              await claimQueueClient.poll();
            }
          }
        }

        // const waitTime = 1;
        await CommonUtils.sleep(100);
      }
    });
    return Promise.resolve(undefined);
  }
}
