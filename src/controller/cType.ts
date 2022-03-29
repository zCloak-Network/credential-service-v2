import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide, Query,
} from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/result';
import { CTypeService } from '../service/ctype';
import { CType } from '../entity/cType';

@Provide()
@Controller('/ctypes')
export class CtypeController {
  @Inject()
  cTypeService: CTypeService;

  @CreateApiDoc()
    .summary('query ctype')
    .description('query a ctype by ctypeHash')
    .param('ctypeHash')
    .respond(200, 'a ctype')
    .build()
  @Get('/one')
  async getByCTypeHash(@Query('ctypeHash') cTypeHash: string) {
    const data = await this.cTypeService.getByCTypeHash(cTypeHash);
    return ResultVO.success(data);
  }

  @CreateApiDoc()
    .summary('add ctype')
    .description('add a new ctype')
    .param('ctype entity')
    .respond(200, 'execute success')
    .build()
  @Post('/add')
  async save(@Body(ALL) cType: CType) {
    await this.cTypeService.save(cType);
    return ResultVO.success();
  }

  @CreateApiDoc()
    .summary('query ctypes')
    .description('query all ctype')
    .param('')
    .respond(200, 'ctype array')
    .build()
  @Get('/all')
  async listCType() {
    const data = await this.cTypeService.listCType();
    return ResultVO.success(data);
  }
}
