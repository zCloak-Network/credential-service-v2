import { Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel as InjectEntityModel2 } from '@midwayjs/orm';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Repository } from 'typeorm';
import { notTransfer, TransferStatus } from '../constant/transferStatus';
import { TransferEntity } from '../entity/mysql/TransferEntity';
import { Transfer } from '../entity/Transfer';
import { ObjUtils } from '../util/ObjUtils';

@Provide()
export class TransferService {
  @InjectEntityModel(Transfer)
  transferModel: ReturnModelType<typeof Transfer>;

  @InjectEntityModel2(TransferEntity)
  transferRepository: Repository<TransferEntity>;

  @Logger('faucet')
  logger: ILogger;

  async getUserTransferStatusByAddress(addressTo: string) {
    const transfer = await this.transferModel.findOne({ addressTo });
    if (ObjUtils.isNotNull(transfer)) {
      return transfer.transferStatus;
    }
    return notTransfer;
  }

  async getByAddress(addressTo: string) {
    return await this.transferModel.findOne({ addressTo }).exec();
  }

  async getByAddress2(transferStatus: TransferStatus, startTime) {
    // return await this.transferModel.findOne({ addressTo }).exec();
    // use timestamp asc, so we can fetch oldest address but more than(not equal) startTime
    return await this.transferModel
      .find({ transferStatus, timestamp: { $gt: startTime } })
      .sort({ timestamp: 1 })
      .limit(1);
  }

  async save(transfer: Transfer) {
    await this.transferModel.create(transfer);

    // TODO double write to mysql ==start
    const { transferStatus, addressFrom, addressTo, value, timestamp } =
      transfer;
    const entity = new TransferEntity();
    entity.transferStatus = transferStatus;
    entity.addressFrom = addressFrom;
    entity.addressTo = addressTo;
    entity.value = value;
    entity.timestamp = timestamp;

    await this.transferRepository.save(entity);
    // TODO double write to mysql ==end
  }

  async updateTransferStatusById(id: any, transferStatus: TransferStatus) {
    await this.transferModel.findByIdAndUpdate(id, { transferStatus });

    // TODO double write to mysql ==start
    // 1.find this in mongo
    const doc = await this.transferModel.findById(id).exec();
    if (doc) {
      const { addressFrom, addressTo, value, timestamp } = doc.toObject();

      // 2.match in mysql, then update
      const { affected } = await this.transferRepository.update(
        {
          addressFrom,
          addressTo,
          value,
          timestamp,
        },
        { transferStatus }
      );
      this.logger.debug(
        `update transfer status success addressFrom ${addressFrom} addressTo ${addressTo} value ${value}, affected rows ${affected}`
      );
      // TODO double write to mysql ==end
    }
  }
}
