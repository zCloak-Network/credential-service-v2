import { Provide } from '@midwayjs/decorator'
import { ReturnModelType } from '@typegoose/typegoose'
import { Attester } from '../entity/Attester'
import { InjectEntityModel } from '@midwayjs/typegoose'

@Provide()
export class AttesterService {
  @InjectEntityModel(Attester)
  attesterModel: ReturnModelType<typeof Attester>

  async listAttester() {
    return await this.attesterModel.find().exec();
  }
}
