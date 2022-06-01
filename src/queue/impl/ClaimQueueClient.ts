import { Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel } from '@midwayjs/orm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { AppConstant } from '../../constant/AppConstant';
import { ObjUtils } from '../../util/ObjUtils';
import { ClaimQueue } from './ClaimQueue';
import { IQueueClient } from '../IQueueClient';

@Provide('claimQueueClient')
export class ClaimQueueClient implements IQueueClient<ClaimQueue> {
  @Logger()
  logger: ILogger;

  @InjectEntityModel(ClaimQueue)
  claimQueueRepository: Repository<ClaimQueue>;

  logPrefix = `claim queue >`;

  async peek(): Promise<ClaimQueue> {
    const one = await this.claimQueueRepository.findOne({
      where: {
        deleteFlag: AppConstant.IS_NOT_DELETE,
      },
      order: {
        id: 'ASC',
      },
    });

    if (ObjUtils.isNotNull(one)) {
      this.logger.debug(`${this.logPrefix} peek item from queue`);
    }

    return one;
  }

  async add(t: ClaimQueue) {
    this.logger.debug(`${this.logPrefix} add item ${t.rootHash}`);
    await this.claimQueueRepository.save(t);
  }

  async getPosition(key: any) {
    // exists determine
    const current = await this.claimQueueRepository.findOneBy({
      rootHash: key,
      deleteFlag: AppConstant.IS_NOT_DELETE,
    });

    if (ObjUtils.isNull(current)) {
      return 0;
    }

    const position = await this.claimQueueRepository.count({
      where: {
        deleteFlag: AppConstant.IS_NOT_DELETE,
        id: LessThanOrEqual(current.id),
      },
    });

    return position;
  }

  async poll(): Promise<ClaimQueue> {
    const one = await this.claimQueueRepository.findOne({
      where: {
        deleteFlag: AppConstant.IS_NOT_DELETE,
      },
      order: {
        id: 'ASC',
      },
    });

    if (ObjUtils.isNotNull(one)) {
      one.deleteFlag = AppConstant.IS_DELETE;
      await this.claimQueueRepository.update({
        id: one.id,
      }, one);
      this.logger.debug(`${this.logPrefix} poll item from queue`);
    }

    return one;
  }

}
