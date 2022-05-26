import { App, Config, Configuration } from '@midwayjs/decorator';
import { ILifeCycle, IMidwayContainer } from '@midwayjs/core';
import { Application } from 'egg';
import { join } from 'path';
import * as typegoose from '@midwayjs/typegoose';
import * as swagger from '@midwayjs/swagger';
import Web3 from 'web3';
import * as orm from '@midwayjs/orm';

@Configuration({
  imports: [
    typegoose,
    swagger,
    orm,
  ],
  importConfigs: [join(__dirname, './config')],
  conflictCheck: true,
})
export class ContainerLifeCycle implements ILifeCycle {
  @App()
  app: Application;

  @Config('zCloak.moonbase.url')
  chainUrl: string;

  async onReady(container: IMidwayContainer) {
    // inject web3
    const web3 = new Web3(this.chainUrl);
    container.registerObject('web3', web3);

    console.log(`Current ENVIRONMENT: ${this.app.getEnv()}`);
  }
}
