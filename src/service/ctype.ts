import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typegoose';
import { ReturnModelType } from '@typegoose/typegoose';
import { CType } from '../entity/cType';
import { getOne } from '../util/array';

@Provide()
export class CTypeService {
  @InjectEntityModel(CType)
  cTypeModel: ReturnModelType<typeof CType>;

  async getByCTypeHash(cTypeHash: string) {
    const cTypes = await this.cTypeModel.find({ ctypeHash: cTypeHash }).exec();
    return getOne(cTypes);
  }

  async save(cType: CType) {
    await this.cTypeModel.create(cType);
  }

  async listCType() {
    return await this.cTypeModel.find().exec();
  }
}
