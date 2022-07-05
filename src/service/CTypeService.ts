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
    const count = await this.cTypeModel
      .count({
        ctypeHash: cType.ctypeHash,
        owner: cType.owner,
      })
      .exec();
    if (count < 1) {
      await this.cTypeModel.create(cType);
    }
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
    const count = await this.rowScanCTypeModel
      .count({
        ctypeHash: cType.ctypeHash,
        owner: cType.owner,
      })
      .exec();
    if (count < 1) {
      await this.rowScanCTypeModel.create(cType);
    }
  }

  async countCTypeOnChain() {
    return await this.rowScanCTypeModel.count().exec();
  }

  async listAllCTypeHashOnChain() {
    const cTypes = await this.rowScanCTypeModel.find().exec();
    if (cTypes && cTypes.length > 0) {
      return cTypes.map(cType => {
        const obj = cType.toObject();
        return obj.ctypeHash;
      });
    }
    return null;
  }
}
