import { Application } from 'egg';
import { CTypeService } from '../../service/CTypeService';
import { CTypeScanTask } from '../../task/ctype/CTypeScanTask';
import { ITask } from '../../task/ITask';
import { AppInitializer } from '../AppInitializer';

export class CTypeScanTaskInitializer implements AppInitializer {
  async doInit(app: Application): Promise<void> {
    const config = await app
      .getApplicationContext()
      .getConfigService()
      .getConfiguration('zCloak.scan.cType');

    config.cTypeService = await app
      .getApplicationContext()
      .getAsync(CTypeService);

    // inject logger
    config.logger = await app.getLogger('ctype-scan');

    const cTypeScanTask: ITask = new CTypeScanTask(config);
    await cTypeScanTask.doTask();
  }
}
