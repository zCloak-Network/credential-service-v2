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
import { SubmitClaimRequest } from '../request/SubmitClaimRequest';
import { AdminAttesterService } from '../service/AdminAttesterService';

@Provide()
@Controller('/admin-attester', {
  tagName: 'admin attester interface',
  description: 'v1',
})
export class AdminAttesterController {
  @Inject()
  adminAttesterService: AdminAttesterService;

  @CreateApiDoc()
    .summary('query claim attest status')
    .description('query claim attest status by senderKeyId')
    .param('senderKeyId')
    .respond(200, 'attestation status', 'json', {
      example: {
        code: 200,
        data: {
          attestationStatus: 3
        },
      },
    })
    .build()
  @Get('/attestation-status')
  async getAttestationStatus(@Query('senderKeyId') senderKeyId: string) {
    const attestationStatus =
      await this.adminAttesterService.getAttestationStatusBySenderKeyId(
        senderKeyId
      );
    return ResultVO.success({ attestationStatus });
  }

  @CreateApiDoc()
    .summary('submit for get credential')
    .description(
      'submit user input claim, generate credential by system admin attester'
    )
    .param('user entered claim entity')
    .respond(200, 'system generated credential', 'json', {
      example: {
        code: 200,
        data: {},
      },
    })
    .build()
  @Post('/submit-claim')
  async submitClaim(@Body(ALL) submitClaimRequest: SubmitClaimRequest) {
    await this.adminAttesterService.submitClaim(submitClaimRequest);
    return ResultVO.success();
  }
}