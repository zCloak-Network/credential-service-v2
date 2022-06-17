import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CType } from '../entity/CType';
import { RowScanCType } from '../entity/RowScanCType';

@Provide()
export class CTypeService {
  @InjectEntityModel(CType)
  cTypeModel: ReturnModelType<typeof CType>;

  @InjectEntityModel(RowScanCType)
  rowScanCTypeModel: ReturnModelType<typeof RowScanCType>;

  async getByCTypeHash(cTypeHash: string) {
    return await this.cTypeModel.findOne({ ctypeHash: cTypeHash }).exec();
  }

  async save(cType: CType) {
    await this.cTypeModel.create(cType);
  }

  async listCType() {
    return await this.cTypeModel.find().exec();
  }

  async listCTypeByAddress(address: string) {
    return await this.cTypeModel.find({ owner: address }).exec();
  }

  async getByCTypeHashFromChain(cTypeHash: string) {
    return await this.rowScanCTypeModel
      .findOne({ ctypeHash: cTypeHash })
      .exec();
  }

  async saveOnChainCType(cType: CType) {
    await this.rowScanCTypeModel.create(cType);
  }
}
