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
import { ClaimService } from '../service/ClaimService';
import { ResultVO } from '../vo/ResultVO';
import { Claim } from '../entity/Claim'
import { SaveClaimRequest } from '../request/SaveClaimRequest'

@Provide()
@Controller('/message')
export class MessageController {
  @Inject()
  claimService: ClaimService;

  @CreateApiDoc()
    .summary('query claim')
    .description('query claims by receiver')
    .param('receiver')
    .respond(200, 'claim array')
    .build()
  @Get('/one')
  async getByReceiver(@Query('receiver') receiver: string) {
    const data = await this.claimService.getByReceiver(receiver);
    return ResultVO.success(data);
  }

  @CreateApiDoc()
    .summary('add claim')
    .description('add a new claim')
    .param('claim entity')
    .respond(200, 'execute success')
    .build()
  @Post('/add')
  async save(@Body(ALL) claimReq: SaveClaimRequest) {
    const claim = claimReq as Claim;
    await this.claimService.save(claim);
    return ResultVO.success();
  }
}
