import { Controller, Get, Inject, Provide, Query } from '@midwayjs/decorator';
import { UserService } from '../service/UserService';
import { CreateApiDoc } from '@midwayjs/swagger';
import { ResultVO } from '../vo/ResultVO';
import { TransferService } from '../service/TransferService';

@Provide()
@Controller('/user', {
  tagName: 'user operator interface',
  description: 'v1',
})
export class UserController {
  @Inject()
  userService: UserService;

  @Inject()
  transferService: TransferService;

  @CreateApiDoc()
    .summary('query user acquired token status')
    .description('query user acquired token status by user address')
    .param('user address')
    .respond(200, 'the status', 'json', {
      example: {
        code: 200,
        data: {
          status: 1,
        },
      },
    })
    .build()
  @Get('/faucet-status')
  async getFaucetStatus(@Query('address') address: string) {
    const data = await this.transferService.getUserTransferStatusByAddress(
      address
    );
    return ResultVO.success({ status: data });
  }

  @CreateApiDoc()
    .summary('a faucet that user can get token')
    .description('user get token by address')
    .param('user address')
    .respond(200, 'operator success', 'json', {
      example: {
        code: 200,
        data: {},
      },
    })
    .build()
  @Get('/faucet')
  async getFaucet(@Query('address') address: string) {
    const result = await this.userService.transferToUser(address);
    if (result === -1) {
      return ResultVO.error('repeat get token');
    }
    return ResultVO.success();
  }
}
