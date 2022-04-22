import { Config, Inject, Logger, Provide } from '@midwayjs/decorator';
import Web3 from 'web3';
import { Transfer } from '../entity/Transfer';
import { TransferService } from './TransferService';
import { ILogger } from '@midwayjs/logger';
import { transfering, transferSuccess } from '../constant/transferStatus';
import { ObjUtils } from '../util/ObjUtils';
import { CommonUtils } from '../util/CommonUtils';

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

  async transferToUser(addressTo: string) {
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
    const transferModel = await this.transferService.save(transfer);

    const transferId = transferModel._id;

    const startBalance = await this.getBalance(transfer.addressTo);

    this.doTransferToUser(transfer).then(async () => {
      let newBalance = startBalance;

      // polling
      for (;;) {
        newBalance = await this.getBalance(transfer.addressTo);
        if (newBalance !== startBalance) {
          break;
        }
        // sleep
        await CommonUtils.sleep(2 * 1000);
      }

      await this.transferService.updateTransferStatusById(
        transferId,
        transferSuccess
      );
    });
  }

  private async doTransferToUser(transfer: Transfer) {
    this.logger.debug(
      `Attempting to send transaction from ${transfer.addressFrom} to ${transfer.addressTo}`
    );

    // Sign tx with PK
    const createTransaction = await this.web3.eth.accounts.signTransaction(
      {
        gas: this.gas,
        to: transfer.addressTo,
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
