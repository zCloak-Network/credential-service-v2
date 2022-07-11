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
import { Claim } from '../entity/Claim';
import { SaveClaimRequest } from '../request/SaveClaimRequest';
import { ClaimService } from '../service/ClaimService';
import { MessageService } from '../service/MessageService';
import { ResultVO } from '../vo/ResultVO';

@Provide()
@Controller('/message')
export class MessageController {
  @Inject()
  claimService: ClaimService;

  @Inject()
  messageService: MessageService;

  @CreateApiDoc()
    .summary('query claim')
    .description('query claims by receiverKeyId')
    .param('receiverKeyId')
    .respond(200, 'claim array')
    .build()
  @Get('/one')
  async getByReceiver(@Query('receiverKeyId') receiverKeyId: string) {
    const data = await this.claimService.getByReceiverKeyId(receiverKeyId);
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
    const { ciphertext, nonce, senderKeyId, receiverKeyId } = claimReq;
    const claim = new Claim();
    claim.ciphertext = ciphertext;
    claim.nonce = nonce;
    claim.senderKeyId = senderKeyId;
    claim.receiverKeyId = receiverKeyId;

    await this.claimService.save(claim);
    return ResultVO.success();
  }

  @Post('/')
  async saveMessage(@Body(ALL) claimReq: SaveClaimRequest) {
    return await this.messageService.saveAndVerify(claimReq);
  }

  @Get('/')
  async listMessage(
    @Query('receiverKeyId') receiverKeyId: string,
    @Query('senderKeyId') senderKeyId: string,
    @Query('start_id') startId: number,
    @Query('size') size: number
  ) {
    const data = await this.messageService.listMessage(
      receiverKeyId,
      senderKeyId,
      startId,
      size
    );
    return ResultVO.success(data);
  }
}
