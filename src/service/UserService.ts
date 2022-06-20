import { Config, Inject, Logger, Provide } from '@midwayjs/decorator';
import Web3 from 'web3';
import { Transfer } from '../entity/Transfer';
import { TransferService } from './TransferService';
import { ILogger } from '@midwayjs/logger';
import { transfering, transferSuccess } from '../constant/transferStatus';
import { CommonUtils } from '../util/CommonUtils';
import { ObjUtils } from '../util/ObjUtils';

@Provide()
export class UserService {
  @Config('zCloak.moonbase.privateKey')
  privateKey: string;

  @Config('zCloak.moonbase.address')
  addressFrom: string;

  @Config('zCloak.moonbase.tokenNumber')
  tokenNumber: string;

  @Config('zCloak.moonbase.gas')
  gas: string;

  @Inject()
  web3: Web3;

  @Logger()
  logger: ILogger;

  @Inject()
  transferService: TransferService;

  nonce: number;

  async polling() {
    let startTime = 0;
    while (true) {
      try {
        this.logger.debug(`FindOne from ${startTime}`);
        const recordList = await this.transferService.getByAddress2(
          2,
          startTime
        );

        this.logger.debug(`FindOne from ${recordList.length}`);

        if (!recordList || recordList.length <= 0) {
          await CommonUtils.sleep(1000);
          continue;
        }

        const record = recordList[0];

        this.logger.debug(`current local NONCE ${this.nonce}`);
        if (!this.nonce) {
          this.nonce = await this.web3.eth.getTransactionCount(
            this.addressFrom
          );
          this.logger.debug(`fetch onchain NONCE ${this.nonce}`);
        } else {
          this.nonce = this.nonce + 1;
          this.logger.debug(`use local NONCE ${this.nonce}`);
        }

        // don't await
        await this.step(record);
        startTime = record.timestamp;

        await CommonUtils.sleep(1000);
      } catch (e) {
        this.nonce = undefined;
        this.logger.warn(`transfer error: ${JSON.stringify(e)}`);
      }
    }
  }

  async step(record) {
    const start = new Date().getTime();

    await this.doTransferToUser(record.addressFrom, record.addressTo);
    // await this.pollingUserBalance(startBalance, transfer);

    await this.transferService.updateTransferStatusById(
      record._id,
      transferSuccess
    );

    this.logger.debug(
      `Successfully transfer money to user ${record.addressTo} , balance ${
        this.tokenNumber
      }, cost ${new Date().getTime() - start}ms`
    );
  }

  async add(addressTo: string) {
    // check transfer uniqueness
    const record = await this.transferService.getByAddress(addressTo);
    if (ObjUtils.isNotNull(record)) {
      return -1;
    }

    // record transfer status
    const transfer = new Transfer();
    transfer.transferStatus = transfering;
    transfer.timestamp = Date.now();
    transfer.addressFrom = this.addressFrom;
    transfer.addressTo = addressTo;
    transfer.value = this.tokenNumber;
    await this.transferService.save(transfer);

    // const transferModel =
    // const transferId = transferModel._id;

    // const startBalance = await this.getBalance(transfer.addressTo);

    // this.logger.debug(`The balance of ${addressTo} is: ${startBalance} ETH`);

    // .catch(async err => {
    //   this.logger.warn(
    //     `failed to transfer money to user ${addressTo} , now rollback transfer status to notTransfer: ${JSON.stringify(
    //       err
    //     )}`
    //   );
    //   // rollback transfer status
    //   await this.transferService.updateTransferStatusById(
    //     transferId,
    //     notTransfer
    //   );
    // });
  }

  // private async pollingUserBalance(startBalance: number, transfer: Transfer) {
  //   let newBalance = startBalance;

  //   // polling
  //   for (;;) {
  //     newBalance = await this.getBalance(transfer.addressTo);
  //     if (newBalance !== startBalance) {
  //       this.logger.debug(
  //         `The new balance of ${transfer.addressTo}, before is: ${startBalance} ETH, end is ${newBalance} ETH`
  //       );
  //       break;
  //     }

  //     this.logger.debug('every 2 seconds polling user balance');

  //     // sleep
  //     await CommonUtils.sleep(2 * 1000);
  //   }
  // }

  private async doTransferToUser(addressFrom, addressTo) {
    this.logger.debug(
      `Attempting to send transaction from ${addressFrom} to ${addressTo}`
    );

    // Sign tx with PK
    const createTransaction = await this.web3.eth.accounts.signTransaction(
      {
        nonce: this.nonce,
        gas: this.gas,
        to: addressTo,
        value: this.web3.utils.toWei(this.tokenNumber, 'ether'),
      },
      this.privateKey
    );

    // Send tx and wait for receipt
    const createReceipt = await this.web3.eth.sendSignedTransaction(
      createTransaction.rawTransaction
    );

    this.logger.debug(
      `Transaction successful with hash: ${createReceipt.transactionHash}`
    );
  }

  async getBalance(address: string) {
    const balanceStr = this.web3.utils.fromWei(
      await this.web3.eth.getBalance(address),
      'ether'
    );
    return Number(balanceStr);
  }
}
