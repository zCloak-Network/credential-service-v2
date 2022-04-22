import { Provide } from '@midwayjs/decorator';
import { notTransfer, TransferStatus } from '../constant/transferStatus';
import { ReturnModelType } from '@typegoose/typegoose';
import { Transfer } from '../entity/Transfer';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ObjUtils } from '../util/ObjUtils';

@Provide()
export class TransferService {
  @InjectEntityModel(Transfer)
  transferModel: ReturnModelType<typeof Transfer>;

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

  async save(transfer: Transfer) {
    return await this.transferModel.create(transfer);
  }

  async updateTransferStatusById(id: any, transferStatus: TransferStatus) {
    await this.transferModel.findByIdAndUpdate(id, { transferStatus });
  }
}
