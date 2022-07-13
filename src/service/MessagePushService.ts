import {
  App,
  Logger,
  MidwayFrameworkType,
  Provide,
  Scope,
  ScopeEnum,
} from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { InjectEntityModel } from '@midwayjs/orm';
import { Application as SocketApplication } from '@midwayjs/socketio/dist/interface';
import { MoreThan, Repository } from 'typeorm';
import { WebSocketConstant } from '../constant/WebSocketConstant';
import { Claim } from '../entity/mysql/Claim';

@Provide()
@Scope(ScopeEnum.Singleton)
export class MessagePushService {
  socketIdToAddressMap = new Map<string, string>();
  addressToSocketIdMap = new Map<string, string>();

  addressToStartNumMap = new Map<string, number>();

  @Logger('message-push')
  logger: ILogger;

  @App(MidwayFrameworkType.WS_IO)
  socketApp: SocketApplication;

  @InjectEntityModel(Claim)
  claimRepository: Repository<Claim>;

  async subscribeMessage(socketId: string, address: string, startId: number) {
    this.logger.info(
      `client subscribe message socketId ${socketId} address ${address} startId ${startId}`
    );

    this.socketIdToAddressMap.set(socketId, address);
    this.addressToSocketIdMap.set(address, socketId);
    this.addressToStartNumMap.set(address, startId);

    // push message to client
    const messages = await this.claimRepository.findBy({
      receiverAddress: address,
      id: startId ? MoreThan(startId) : null,
    });

    await this.sendMessage(messages);
  }

  disconnect(socketId: string) {
    const address = this.socketIdToAddressMap.get(socketId);
    const startId = this.addressToStartNumMap.get(address);
    this.logger.info(
      `client disconnect socketId ${socketId} address ${address} startId ${startId}`
    );

    this.socketIdToAddressMap.delete(socketId);
    this.addressToStartNumMap.delete(address);
    this.addressToSocketIdMap.delete(address);
  }

  async sendMessage(args: Claim | Claim[]) {
    const addressMessageMap = this.getAddressMapForSend(args);

    addressMessageMap.forEach((m, a) => {
      const socketId = this.addressToSocketIdMap.get(a);

      this.logger.debug(
        `send message to online client address ${a} socketId ${socketId}`
      );

      try {
        // notify receiver
        this.socketApp
          .of(WebSocketConstant.DEFAULT_NAMESPACE)
          .to(socketId)
          .emit(WebSocketConstant.MESSAGE_LIST, m);
      } catch (err) {
        this.logger.error(`message push error ${a}`);
      }
    });
  }

  /**
   * return address -> [message1, message2, message3]
   * @param obj
   */
  getAddressMapForSend(obj: Claim | Claim[]) {
    const addressMessageMap = new Map<string, Claim[]>();
    const messages: Claim[] = [];
    if (obj instanceof Array) {
      for (const o of obj) {
        messages.push(o);
      }
    }
    if (obj instanceof Claim) {
      messages.push(obj);
    }

    for (const message of messages) {
      const { receiverAddress, id } = message;
      let arr = addressMessageMap.get(receiverAddress);
      if (!arr) {
        arr = [];
      }

      if (this.checkSendCondition(receiverAddress, id)) {
        arr.push(message);
        addressMessageMap.set(receiverAddress, arr);
      } else {
        this.logger.warn(
          `message will not be send, because  id ${id} startId ${this.addressToStartNumMap.get(
            receiverAddress
          )} receiverAddress ${receiverAddress} client status ${
            this.addressToSocketIdMap.has(receiverAddress)
              ? 'online'
              : 'offline'
          }`
        );
      }
    }

    return addressMessageMap;
  }

  /**
   * sending condition
   * 1. receiver is online
   * 2. id > startId
   * @param receiverAddress
   * @param id
   */
  checkSendCondition(receiverAddress: string, id: number) {
    const startId = this.addressToStartNumMap.get(receiverAddress);
    return (
      this.addressToSocketIdMap.has(receiverAddress) &&
      (!startId || id > startId)
    );
  }
}
