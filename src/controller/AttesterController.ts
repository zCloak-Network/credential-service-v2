import { Controller, Get, Inject, Provide } from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { AttesterService } from '../service/AttesterService';

@Provide()
@Controller('/attester')
export class AttesterController {
  @Inject()
  attesterService: AttesterService;

  @CreateApiDoc()
    .summary('query attester')
    .description('query all attester')
    .param('')
    .respond(200, 'attester array')
    .build()
  @Get('/all')
  async listAttester() {
    const data = await this.attesterService.listAttester();
    return ResultVO.success(data);
  }
}
