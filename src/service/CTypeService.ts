import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel as InjectEntityModel2 } from '@midwayjs/orm';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { Repository } from 'typeorm';
import { CType } from '../entity/CType';
import { CTypeEntity } from '../entity/mysql/CTypeEntity';
import { RowScanCTypeEntity } from '../entity/mysql/RowScanCTypeEntity';
import { RowScanCType } from '../entity/RowScanCType';

@Provide()
export class CTypeService {
  @InjectEntityModel(CType)
  cTypeModel: ReturnModelType<typeof CType>;

  @InjectEntityModel(RowScanCType)
  rowScanCTypeModel: ReturnModelType<typeof RowScanCType>;

  @InjectEntityModel2(CTypeEntity)
  cTypeRepository: Repository<CTypeEntity>;

  @InjectEntityModel2(RowScanCTypeEntity)
  rowScanCTypeRepository: Repository<RowScanCTypeEntity>;

  async getByCTypeHash(cTypeHash: string) {
    return await this.cTypeModel.findOne({ ctypeHash: cTypeHash }).exec();
  }

  async save(cType: CType) {
    const { ctypeHash, owner, metadata } = cType;
    const count = await this.cTypeModel
      .count({
        ctypeHash,
        owner,
      })
      .exec();
    if (count < 1) {
      await this.cTypeModel.create(cType);
    }

    // TODO double write to mysql ==start
    const count2 = await this.cTypeRepository.countBy({
      ctypeHash,
      owner,
    });
    if (count2 < 1) {
      const c = new CTypeEntity();
      c.owner = owner;
      c.metadata = metadata;
      c.ctypeHash = ctypeHash;
      await this.cTypeRepository.save(c);
    }
    // TODO double write to mysql ==end
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
    const { ctypeHash, owner, metadata } = cType;
    const count = await this.rowScanCTypeModel
      .count({
        ctypeHash,
        owner,
      })
      .exec();
    if (count < 1) {
      await this.rowScanCTypeModel.create(cType);
    }

    // TODO double write to mysql ==start
    const count2 = await this.rowScanCTypeRepository.countBy({
      ctypeHash,
      owner,
    });
    if (count2 < 1) {
      const c = new RowScanCTypeEntity();
      c.owner = owner;
      c.ctypeHash = ctypeHash;
      c.metadata = metadata;
      await this.rowScanCTypeRepository.save(c);
    }
    // TODO double write to mysql ==end
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
