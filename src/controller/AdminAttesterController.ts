import {
  ALL,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Provide,
  Query,
} from '@midwayjs/decorator';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { SubmitClaimRequest } from '../request/SubmitClaimRequest';
import { AdminAttesterService } from '../service/AdminAttesterService';
import { ReCaptchaService } from '../service/ReCaptchaService';
import { Context } from '@midwayjs/web';
import { ILogger } from '@midwayjs/logger';

@Provide()
@Controller('/admin-attester', {
  tagName: 'admin attester interface',
  description: 'v1',
})
export class AdminAttesterController {
  @Inject()
  adminAttesterService: AdminAttesterService;

  @Inject()
  reCaptchaService: ReCaptchaService;

  @Logger()
  logger: ILogger;

  @Inject()
  ctx: Context;

  @CreateApiDoc()
    .summary('query claim attest status')
    .description('query claim attest status by senderKeyId')
    .param('senderKeyId')
    .respond(200, 'attestation status', 'json', {
      example: {
        code: 200,
        data: {
          attestationStatus: 3,
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

  // @CreateApiDoc()
  //   .summary('submit for get credential')
  //   .description(
  //     'submit user input claim, generate credential by system admin attester'
  //   )
  //   .param('user entered claim entity')
  //   .respond(200, 'system generated credential', 'json', {
  //     example: {
  //       code: 200,
  //       data: {},
  //     },
  //   })
  //   .build()
  // @Post('/submit-claim')
  // async submitClaim(@Body(ALL) submitClaimRequest: SubmitClaimRequest) {
  //   // 废弃该接口
  //   return ResultVO.error('verify failed.');

  //   const ip = this.ctx.request.headers['x-real-ip'];
  //   if (
  //     !(await this.reCaptchaService.verify(submitClaimRequest.reCaptchaToken))
  //   ) {
  //     this.logger.warn(`verify failed, ip:${ip}`);
  //     return ResultVO.error('verify failed.');
  //   }

  //   this.logger.info(`SubmitClaim  x-real-ip > ${ip}`);

  //   if (ip === '47.243.120.137' || ip === '60.157.127.89') {
  //     this.logger.info(`illegal  x-real-ip > ${ip}`);
  //     return;
  //   }

  //   await this.adminAttesterService.submitClaim(submitClaimRequest);
  //   return ResultVO.success();
  // }

  @CreateApiDoc()
    .summary('submit claim')
    .param('claim entity')
    .respond(200, 'operate success', 'json', {
      example: {
        code: 200,
        data: {},
      },
    })
    .build()
  @Post('/claim')
  async submitClaimToQueue(@Body(ALL) submitClaimRequest: SubmitClaimRequest) {
    const ip = this.ctx.request.headers['x-real-ip'];
    if (
      !(await this.reCaptchaService.verify(submitClaimRequest.reCaptchaToken))
    ) {
      this.logger.warn(`verify failed, ip:${ip}`);
      return ResultVO.error('verify failed.');
    }

    this.logger.debug(`SubmitClaimToQueue  x-real-ip > ${ip}`);

    if (ip === '47.243.120.137' || ip === '60.157.127.89') {
      this.logger.info(`illegal  x-real-ip > ${ip}`);
      return;
    }

    await this.adminAttesterService.submitClaimToQueue(submitClaimRequest);
    return ResultVO.success();
  }

  @CreateApiDoc()
    .summary('get claim status')
    .param('claim id')
    .respond(200, 'operate success', 'json', {
      example: {
        code: 200,
        data: {
          status: 1,
          position: 2,
        },
      },
    })
    .build()
  @Get('/claim/:rootHash/attested-status')
  async getClaimAttestedStatus(@Param('rootHash') rootHash: string) {
    const status = await this.adminAttesterService.getClaimAttestedStatus(
      rootHash
    );
    return ResultVO.success(status);
  }
}
