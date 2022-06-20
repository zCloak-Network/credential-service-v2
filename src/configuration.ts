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

  @Inject()
  adminAttesterService: AdminAttesterService;

  async onReady(container: IMidwayContainer) {
    console.log(`Current ENVIRONMENT: ${this.app.getEnv()}`);

    // inject web3
    const web3 = new Web3(this.chainUrl);
    container.registerObject('web3', web3);

    // await AppInitializerHelper.init(this.app);

    // 不要await
    new SubmitAttestationTaskInitializer().doInit(this.app);
  }
}
