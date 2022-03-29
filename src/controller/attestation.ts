import {
  ALL,
  Body,
  Controller, Get,
  Inject,
  Post,
  Provide, Query,
} from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/result';
import { Attestation } from '../entity/attestation';
import { AttestationService } from '../service/attestation';

@Provide()
@Controller('/attestation')
export class AttestationController {
  @Inject()
  attestationService: AttestationService;

  @CreateApiDoc()
    .summary('query attestation')
    .description('query attestations by receiver')
    .param('receiver')
    .respond(200, 'attestation array')
    .build()
  @Get('/one')
  async getByReceiver(@Query('receiver') receiver: string) {
    const data = await this.attestationService.getByReceiver(receiver);
    return ResultVO.success(data);
  }

  @CreateApiDoc()
    .summary('add attestation')
    .description('add a new attestation')
    .param('attestation entity')
    .respond(200, 'execute success')
    .build()
  @Post('/add')
  async save(@Body(ALL) attestation: Attestation) {
    await this.attestationService.save(attestation);
    return ResultVO.success();
  }
}