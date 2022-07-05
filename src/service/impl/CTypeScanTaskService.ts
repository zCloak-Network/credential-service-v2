import * as Kilt from '@kiltprotocol/sdk-js';
import { Config, Init, Inject, Logger, Provide } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { CTypeScanConstant } from '../../constant/CTypeScanConstant';
import { SubScanRequestApi } from '../../util/SubScanRequestApi';
import { ITaskService } from '../ITaskService';
import { ArrUtils } from '../../util/ArrUtils';
import { CommonUtils } from '../../util/CommonUtils';
import { RequestApi } from '../../util/RequestApi';
import { CTypeService } from '../CTypeService';

@Provide()
export class CTypeScanTaskService implements ITaskService {
  @Config('zCloak.scan.cType.subScanTokens')
  subScanTokens: string[];

  @Config('zCloak.scan.cType.subScanBaseUrl')
  subScanBaseUrl: string;

  @Logger('ctype-scan')
  logger: ILogger;

  @Inject()
  cTypeService: CTypeService;

  alreadyGetCTypeHashes: Set<string>;

  requestApi: RequestApi;

  @Init()
  async init() {
    // init request api
    this.requestApi = new SubScanRequestApi(
      this.subScanBaseUrl,
      this.subScanTokens
    );

    // load all ctype hash
    const alreadyGetCTypeHashes =
      (await this.cTypeService.listAllCTypeHashOnChain()) || [];
    this.alreadyGetCTypeHashes = new Set(alreadyGetCTypeHashes);
    this.logger.info(
      `list all on chain ctype hash size ${this.alreadyGetCTypeHashes.size}`
    );
  }

  async doTask(): Promise<void> {
    this.logger.info('CTypeScanTask start...');

    let lastCount = 1;

    for (;;) {
      try {
        const currentCount = await this.getCount();

        if (lastCount >= currentCount) {
          this.logger.warn(
            `start scan lastCount >= currentCount, lastCount ${lastCount} currentCount ${currentCount}, continue in ${CTypeScanConstant.DEFAULT_WAIT_TIME}ms`
          );
          await CommonUtils.sleep(CTypeScanConstant.DEFAULT_WAIT_TIME);
          continue;
        }

        await this.scan(lastCount, currentCount);

        this.logger.info(`start scan finish ${currentCount}`);

        lastCount = currentCount;
      } catch (err) {
        this.logger.error(
          `start error lastCount ${lastCount}\n${JSON.stringify(err)}`
        );
        await CommonUtils.sleep(CTypeScanConstant.DEFAULT_ERROR_WAIT_TIME);
      }
    }
  }

  private async getCTypeFromEvent(events: any) {
    this.logger.info(`get ctype from events ${events.length}`);

    const cTypeEvents = events.filter(
      (value: { module_id: string; event_id: string }) => {
        return (
          CTypeScanConstant.MODEL_ID === value.module_id &&
          CTypeScanConstant.EVENT_ID === value.event_id
        );
      }
    );

    const cTypes = [];
    let i = 0;
    while (i < cTypeEvents.length) {
      const cTypeEvent = cTypeEvents[i];
      const extrinsicIndex = cTypeEvent.event_index;
      const extrinsicHash = cTypeEvent.extrinsic_hash;

      try {
        const ctypeHash = await this.getCTypeHash(cTypeEvent);

        if (!this.alreadyGetCTypeHashes.has(ctypeHash)) {
          this.logger.debug(
            `build ${i} ctype extrinsicIndex ${extrinsicIndex}`
          );

          const extrinsic = await this.getExtrinsic(
            extrinsicIndex,
            extrinsicHash
          );
          const metadata = await this.getMetadata(extrinsic, ctypeHash);
          const owner = extrinsic?.id;

          const cType: CType = {
            metadata,
            owner,
            ctypeHash,
          };

          cTypes.push(cType);
        } else {
          this.logger.warn(`${i} ctypeHash already handle ${ctypeHash}, skip`);
        }

        i++;
      } catch (err) {
        this.logger.error(`build ${i} ctype error\n${JSON.stringify(err)}`);
        await CommonUtils.sleep(CTypeScanConstant.DEFAULT_ERROR_WAIT_TIME);
      }
    }
    return cTypes;
  }

  private async getMetadata(extrinsic: any, ctypeHash: string) {
    if (extrinsic) {
      const paramObj = extrinsic.params[0].value.call.params[0].value;
      if (typeof paramObj === 'string') {
        return JSON.parse(paramObj);
      }
      if (paramObj instanceof Array) {
        this.logger.debug(
          `ctype metadata is Array. Next compare the ctype hash value ${ctypeHash}`
        );
        for (const item of paramObj) {
          const schemaStr = item.params[0].value;
          const schema = JSON.parse(schemaStr);
          const hash = Kilt.CTypeUtils.getHashForSchema(schema as any);

          if (hash === ctypeHash) {
            return schema;
          }
        }
      }
    }

    return null;
  }

  private async getCTypeHash(cTypeEvent: any) {
    if (cTypeEvent) {
      const paramsStr = cTypeEvent.params;
      const params = JSON.parse(paramsStr);
      return params[1].value;
    }

    return null;
  }

  private async getExtrinsic(extrinsicIndex: string, extrinsicHash: string) {
    this.logger.debug(
      `get extrinsic extrinsicIndex ${extrinsicIndex} extrinsicHash ${extrinsicHash}`
    );

    const result: any = await this.requestApi.post(
      '/api/scan/extrinsic',
      null,
      {
        extrinsic_index: extrinsicIndex,
        hash: extrinsicHash,
      }
    );

    return result;
  }

  private async scan(lastCount: number, currentCount: number) {
    this.logger.info(
      `start scan lastCount ${lastCount}, currentCount ${currentCount}`
    );

    const maxPage = parseInt(
      (currentCount - lastCount) / CTypeScanConstant.DEFAULT_ROW_COUNT + ''
    );
    const row = CTypeScanConstant.DEFAULT_ROW_COUNT;
    let i = 0;

    while (i <= maxPage) {
      try {
        const result: any = await this.requestApi.post(
          '/api/scan/events',
          null,
          {
            page: i,
            row,
            module: CTypeScanConstant.MODEL_ID,
          }
        );

        if (ArrUtils.isNotEmpty(result.events)) {
          const cTypes = await this.getCTypeFromEvent(result.events);
          await this.handleCType(cTypes);

          i++;
        } else {
          this.logger.debug(
            'ctype events is empty, then exit ctype event scan'
          );
          break;
        }
      } catch (err) {
        this.logger.error(
          `scan error ${i}, lastCount ${lastCount}, currentCount ${currentCount}`
        );
        await CommonUtils.sleep(CTypeScanConstant.DEFAULT_ERROR_WAIT_TIME);
      }
    }
  }

  private async handleCType(cTypes: any[]) {
    if (ArrUtils.isNotEmpty(cTypes)) {
      let i = 0;
      while (i < cTypes.length) {
        const cType = cTypes[i];
        try {
          const ct = await this.cTypeService.getByCTypeHashFromChain(
            cType.ctypeHash
          );
          if (ct) {
            this.logger.debug(
              `${i} ctype is existed, dont save ${cType.ctypeHash}`
            );
          } else {
            // save
            this.logger.debug(`save ${i} ctype\n${JSON.stringify(cType)}`);
            await this.saveCType(cType);
          }

          i++;
        } catch (err) {
          this.logger.error(`handle ${i} ctype error\n${JSON.stringify(err)}`);
          await CommonUtils.sleep(CTypeScanConstant.DEFAULT_ERROR_WAIT_TIME);
        }
      }
    }
  }

  private async saveCType(ctype: CType) {
    return this.cTypeService.saveOnChainCType(ctype);
  }

  private async getCount() {
    const result: any = await this.requestApi.post('/api/scan/events', null, {
      page: 0,
      row: 1,
      module: CTypeScanConstant.MODEL_ID,
    });

    return result.count;
  }
}

interface CType {
  metadata: any;
  owner: string;
  ctypeHash: string;
}
