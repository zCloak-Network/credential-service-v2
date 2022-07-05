import * as Kilt from '@kiltprotocol/sdk-js';
import { ILogger } from '@midwayjs/logger';
import { CTypeService } from '../../service/CTypeService';
import { ArrUtils } from '../../util/ArrUtils';
import { CommonUtils } from '../../util/CommonUtils';
import { RequestApi } from '../../util/RequestApi';
import { ITask } from '../ITask';
import { SubScanRequestApi } from './SubScanRequestApi';

export class CTypeScanTask implements ITask {
  requestApi: RequestApi;

  defaultWaitTime: number;
  defaultErrorWaitTime: number;

  lastCountFile: string;

  modelId: string;
  eventId: string;

  subScanBaseUrl: string;

  defaultRowCount: number;

  logger: ILogger;
  cTypeService: CTypeService;

  alreadyGetCTypeHashes: Set<string>;

  constructor(config: any) {
    this.requestApi = new SubScanRequestApi(config.subScanTokens);

    this.defaultWaitTime = config.defaultWaitTime;
    this.defaultErrorWaitTime = config.defaultErrorWaitTime;

    this.lastCountFile = config.lastCountFileName;

    this.modelId = config.modelId;
    this.eventId = config.eventId;

    this.subScanBaseUrl = config.subScanBaseUrl;

    this.defaultRowCount = config.defaultRowCount;

    this.logger = config.logger;
    this.cTypeService = config.cTypeService;
  }

  async doTask(): Promise<void> {
    this.logger.info('CTypeScanTask start...');
    await this.init();

    let lastCount = await this.getLastCount();

    for (;;) {
      try {
        const currentCount = await this.getCount();

        if (lastCount >= currentCount) {
          this.logger.warn(
            `start scan lastCount >= currentCount, lastCount ${lastCount} currentCount ${currentCount}`
          );
          await CommonUtils.sleep(this.defaultWaitTime);
          continue;
        }

        await this.scan(lastCount, currentCount);

        this.logger.info(`start scan finish ${currentCount}`);

        lastCount = currentCount;
      } catch (err) {
        this.logger.error(
          `start error lastCount ${lastCount}\n${JSON.stringify(err)}`
        );
        await CommonUtils.sleep(this.defaultErrorWaitTime);
      }
    }
  }

  private async init() {
    const alreadyGetCTypeHashes = await this.listAllCTypeHashes();
    this.alreadyGetCTypeHashes = new Set(alreadyGetCTypeHashes);
    this.logger.info(
      `list all on chain ctype hash size ${this.alreadyGetCTypeHashes.size}`
    );
  }

  private async getCTypeFromEvent(events: any) {
    this.logger.info(`get ctype from events ${events.length}`);

    const cTypeEvents = events.filter(
      (value: { module_id: string; event_id: string }) => {
        return (
          this.modelId === value.module_id && this.eventId === value.event_id
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
          const owner = await this.getOwner(extrinsic);

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
        await CommonUtils.sleep(this.defaultErrorWaitTime);
      }
    }
    return cTypes;
  }

  private async getOwner(extrinsic: any) {
    return extrinsic?.id;
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
      `${this.subScanBaseUrl}/api/scan/extrinsic`,
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
      (currentCount - lastCount) / this.defaultRowCount + ''
    );
    const row = this.defaultRowCount;
    let i = 0;

    while (i <= maxPage) {
      try {
        const result: any = await this.requestApi.post(
          `${this.subScanBaseUrl}/api/scan/events`,
          null,
          {
            page: i,
            row,
            module: this.modelId,
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
        await CommonUtils.sleep(this.defaultErrorWaitTime);
      }
    }
  }

  private async handleCType(cTypes: any[]) {
    if (ArrUtils.isNotEmpty(cTypes)) {
      let i = 0;
      while (i < cTypes.length) {
        const cType = cTypes[i];
        try {
          const ct = await this.getCType(cType.ctypeHash);
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
          await CommonUtils.sleep(this.defaultErrorWaitTime);
        }
      }
    }
  }

  private async saveCType(ctype: CType) {
    return this.cTypeService.saveOnChainCType(ctype);
  }

  private async getCType(ctypeHash: string) {
    return await this.cTypeService.getByCTypeHashFromChain(ctypeHash);
  }

  private async getLastCount() {
    // TODO can't find the startCount when program restart, because of the paging model that the lately data in the lately page.
    // now, we use already handle ctype for caching
    // return (await this.cTypeService.countRowCType()) || 1;
    return 1;
  }

  private async getCount() {
    const result: any = await this.requestApi.post(
      `${this.subScanBaseUrl}/api/scan/events`,
      null,
      {
        page: 0,
        row: 1,
        module: 'ctype',
      }
    );

    return result.count;
  }

  private async listAllCTypeHashes() {
    return await this.cTypeService.listAllCTypeHashOnChain();
  }
}

interface CType {
  metadata: any;
  owner: string;
  ctypeHash: string;
}
