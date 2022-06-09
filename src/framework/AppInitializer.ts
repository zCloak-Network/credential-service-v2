import { Application } from 'egg';

/**
 * app framework extend interface for initialize application
 */
export interface AppInitializer {
  doInit(app: Application): Promise<void>;
}
