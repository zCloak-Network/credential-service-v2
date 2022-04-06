import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CType } from '../entity/CType';
import { isEmpty } from '../util/StrUtils';

@Provide()
export class CTypeService {
  @InjectEntityModel(CType)
  cTypeModel: ReturnModelType<typeof CType>;

  async getByCTypeHash(cTypeHash: string) {
    return await this.cTypeModel.findOne({ ctypeHash: cTypeHash }).exec();
  }

  async save(cType: CType) {
    await this.cTypeModel.create(cType);
  }

  async listCType(owner: string) {
    if (isEmpty(owner)) {
      return await this.cTypeModel.find().exec();
    }
    return await this.cTypeModel.find({ owner }).exec();
  }
}
