import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Provide,
} from '@midwayjs/decorator';
import { SaveCTypeRequest } from '../request/SaveCTypeRequest';
import { CTypeService } from '../service/CTypeService';
import { ResultVO } from '../vo/ResultVO';

@Provide()
@Controller('/ctypes')
export class CtypeController {
  @Inject()
  cTypeService: CTypeService;

  @Get('/:cTypeHash')
  async getByCTypeHash(@Param() cTypeHash: string) {
    const data = await this.cTypeService.getByCTypeHash(cTypeHash);
    return ResultVO.success(data);
  }

  @Post('/')
  async save(@Body(ALL) cTypeReq: SaveCTypeRequest) {
    const data = await this.cTypeService.save(cTypeReq);
    return ResultVO.success(data);
  }

  @Get('/')
  async listCType() {
    const data = await this.cTypeService.listCType();
    return ResultVO.success(data);
  }

  @Get('/user/:address')
  async listByAddress(@Param() address: string) {
    const data = await this.cTypeService.listCTypeByAddress(address);
    return ResultVO.success(data);
  }
}
