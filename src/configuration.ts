import { App, Config, Configuration, Inject } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Application } from 'egg';
import { join } from 'path';
import * as typegoose from '@midwayjs/typegoose';
import * as swagger from '@midwayjs/swagger';
import * as orm from '@midwayjs/orm';
import { AdminAttesterService } from './service/AdminAttesterService';
import { SubmitAttestationTaskInitializer } from './framework/impl/SubmitAttestationTaskInitializer';
import { CTypeScanTaskService } from './service/impl/CTypeScanTaskService';
import { UserService } from './service/UserService';

@Configuration({
  imports: [typegoose, swagger, orm],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  // @Config('zCloak.moonbase.url')
  // chainUrl: string;

  @Config('logger')
  loggerConfig: any;

  @Inject()
  adminAttesterService: AdminAttesterService;

  async onReady(container: IMidwayContainer) {
    console.log(
      `current enviroment: ${this.app.getEnv()}, log dir: ${
        this.loggerConfig.dir
      }`
    );

    this.app.createLogger('attestation', {
      dir: this.loggerConfig.dir,
      fileLogName: 'attestation.log',
      level: 'all',
      defaultLabel: 'attestation',
    });

    this.app.createLogger('faucet', {
      dir: this.loggerConfig.dir,
      fileLogName: 'faucet.log',
      level: 'all',
      defaultLabel: 'faucet',
    });

    this.app.createLogger('ctype-scan', {
      dir: this.loggerConfig.dir,
      fileLogName: 'ctype-scan.log',
      level: 'all',
      defaultLabel: 'ctype-scan',
    });

    // inject web3
    // const web3 = new Web3(this.chainUrl);
    // container.registerObject('web3', web3);

    // await AppInitializerHelper.init(this.app);
    new SubmitAttestationTaskInitializer().doInit(this.app);

    const cTypeScanTaskService = await this.app
      .getApplicationContext()
      .getAsync<CTypeScanTaskService>(CTypeScanTaskService);
    cTypeScanTaskService.doTask();

    const userService = await this.app
      .getApplicationContext()
      .getAsync<UserService>(UserService);
    userService.polling();

    // const faucetQueueService = await this.app
    //   .getApplicationContext()
    //   .getAsync(FaucetQueueService);
    // faucetQueueService.addTask({ address: '000' });
  }
}
