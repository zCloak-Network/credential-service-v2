import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Query,
} from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { CTypeService } from '../service/CTypeService';
import { SaveCTypeRequest } from '../request/SaveCTypeRequest';
import { CType } from '../entity/CType';

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
  async save(@Body(ALL) cTypeReq: SaveCTypeRequest) {
    const cType = cTypeReq as CType;
    await this.cTypeService.save(cType);
    return ResultVO.success();
  }

  @CreateApiDoc()
    .summary('query ctypes')
    .description('query all ctype')
    .param('')
    .respond(200, '成功', 'json', {
      example: {
        code: 200,
        data: [
          {
            _id: '6245e47b9fa07a5d33617440',
            metadata: {
              $schema: 'http://kilt-protocol.org/draft-01/ctype#',
              title: 'ctype_1',
              properties: { Name: { type: 'string' } },
              type: 'object',
              $id: 'kilt:ctype:0xad2bfd093f603ed88315bfd208a168792689e63618ac19392473bb857e4aec95',
            },
            ctypeHash:
              '0xad2bfd093f603ed88315bfd208a168792689e63618ac19392473bb857e4aec95',
            __v: 0,
          },
        ],
      },
    })
    .build()
  @Get('/all')
  async listCType(@Query() owner: string) {
    const data = await this.cTypeService.listCType(owner);
    return ResultVO.success(data);
  }
}
