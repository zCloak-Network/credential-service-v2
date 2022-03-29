import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
} from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { AttesterService } from '../service/AttesterService';
import { Attester } from '../entity/Attester';
import { SaveAttesterRequest } from '../request/SaveAttesterRequest';

@Provide()
@Controller('/attester')
export class AttesterController {
  @Inject()
  attesterService: AttesterService;

  @CreateApiDoc()
    .summary('add attester')
    .description('add a new attester')
    .param('attester entity')
    .respond(200, 'execute success')
    .build()
  @Post('/add')
  async save(@Body(ALL) attesterReq: SaveAttesterRequest) {
    const attester = attesterReq as Attester;
    await this.attesterService.save(attester);
    return ResultVO.success();
  }

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
