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
import { WebSocketConstant } from '../constant/WebSocketConstant';
import { MessagePushService } from '../service/MessagePushService';

@Provide()
@WSController(WebSocketConstant.DEFAULT_NAMESPACE)
export class CredentialSocketController {
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
  @OnWSMessage(WebSocketConstant.MESSAGE_SUBSCRIBE)
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
