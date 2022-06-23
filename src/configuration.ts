import { App, Config, Configuration, Inject } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Application } from 'egg';
import { join } from 'path';
import * as typegoose from '@midwayjs/typegoose';
import * as swagger from '@midwayjs/swagger';
import Web3 from 'web3';
import * as orm from '@midwayjs/orm';
// import { AppInitializerHelper } from './framework/AppInitializerHelper';
import { AdminAttesterService } from './service/AdminAttesterService';
import { SubmitAttestationTaskInitializer } from './framework/impl/SubmitAttestationTaskInitializer';
import { UserService } from './service/UserService';

@Configuration({
  imports: [typegoose, swagger, orm],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  @Config('zCloak.moonbase.url')
  chainUrl: string;

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
    });

    this.app.createLogger('faucet', {
      dir: this.loggerConfig.dir,
      fileLogName: 'faucet.log',
      level: 'all',
    });

    // inject web3
    const web3 = new Web3(this.chainUrl);
    container.registerObject('web3', web3);

    // await AppInitializerHelper.init(this.app);

    // kilt queue, don't await
    new SubmitAttestationTaskInitializer().doInit(this.app);

    const userService = await this.app
      .getApplicationContext()
      .getAsync<UserService>(UserService);
    // faucet queue, don't await
    userService.polling();
  }
}
