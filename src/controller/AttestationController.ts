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
import { Attestation } from '../entity/Attestation';
import { AttestationService } from '../service/AttestationService';
import { SaveAttestationRequest } from '../request/SaveAttestationRequest';

@Provide()
@Controller('/attestation', { tagName: 'attestation接口', description: 'v1' })
export class AttestationController {
  @Inject()
  attestationService: AttestationService;

  @CreateApiDoc()
    .summary('根据id查询attestation')
    .description('query attestations by receiver')
    .param('receiver')
    .respond(200, 'attestation array')
    .build()
  @Get('/one')
  async getByReceiver(@Query('receiverKeyId') receiverKeyId: string) {
    const data = await this.attestationService.getByReceiverKeyId(
      receiverKeyId
    );
    return ResultVO.success(data);
  }

  @CreateApiDoc()
    .summary('add attestation')
    .description('add a new attestation')
    .param('attestation entity')
    .respond(200, 'execute success')
    .build()
  @Post('/add')
  async save(@Body(ALL) attestationReq: SaveAttestationRequest) {
    const attestation = attestationReq as Attestation;
    await this.attestationService.save(attestation);
    return ResultVO.success();
  }
}
