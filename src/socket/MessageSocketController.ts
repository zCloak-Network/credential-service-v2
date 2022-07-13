import {
  Inject,
  Logger,
  OnWSConnection,
  OnWSDisConnection,
  OnWSMessage,
  Provide,
  WSController,
} from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { Context } from '@midwayjs/socketio';
import { MessageConstant } from '../constant/MessageConstant';
import { MessagePushService } from '../service/MessagePushService';

@Provide()
@WSController('/')
export class MessageSocketController {
  @Inject()
  ctx: Context;

  @Inject()
  messagePushService: MessagePushService;

  @Logger('message-push')
  logger: ILogger;

  @OnWSDisConnection()
  async onDisConnectionMethod() {
    const socketId = this.ctx.id;
    this.messagePushService.disconnect(socketId);
    this.ctx.disconnect();
  }

  /**
   * subscribe message.
   * @param address
   * @param start_id
   */
  @OnWSMessage(MessageConstant.MESSAGE_SUBSCRIBE)
  async messageSubscribe({ address, start_id }) {
    const socketId = this.ctx.id;
    await this.messagePushService.subscribeMessage(socketId, address, start_id);
  }

  /**
   * identity authentication.
   */
  @OnWSConnection()
  async onConnectionMethod() {}
}
