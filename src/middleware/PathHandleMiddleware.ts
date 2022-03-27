import { Provide } from '@midwayjs/decorator';
import {
  Context,
  IMidwayWebNext,
  IWebMiddleware,
  MidwayWebMiddleware,
} from '@midwayjs/web';

@Provide()
export class PathHandleMiddleware implements IWebMiddleware {
  resolve(): MidwayWebMiddleware {
    return async (ctx: Context, next: IMidwayWebNext) => {
      await next();
    };
  }
}
