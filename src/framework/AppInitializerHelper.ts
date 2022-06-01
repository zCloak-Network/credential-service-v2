import { Application } from 'egg';
import { AppInitializer } from './AppInitializer';
import { SubmitAttestationTaskInitializer } from './impl/SubmitAttestationTaskInitializer';

const initializers = [
  new SubmitAttestationTaskInitializer(),
];

export class AppInitializerHelper {
  static async init(app: Application) {
    for (let appInitializer of AppInitializerHelper.listAppInitializers()) {
      await appInitializer.doInit(app);
    }
  }

  static listAppInitializers(): AppInitializer[] {
    return initializers;
  }
}
