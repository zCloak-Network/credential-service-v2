import { Rule } from '@midwayjs/decorator';
import { RuleType } from '@midwayjs/decorator/dist/annotation/rule';

class IMetadataProperties {
  [key: string]: IMultilangLabel;
}

class IMultilangLabel {
  default: string;

  [key: string]: string;
}

class IMetadata {
  @Rule(RuleType.string())
  title: string;
  @Rule(RuleType.string())
  owner: string;
  @Rule(RuleType.any())
  description: IMultilangLabel;
  @Rule(RuleType.any())
  properties: IMetadataProperties;
}

export class SaveCTypeRequest {
  @Rule(RuleType.string())
  ctypeHash: string;
  @Rule(IMetadata)
  metadata: IMetadata;
  @Rule(RuleType.string())
  owner: string;
  @Rule(RuleType.string())
  description: string;
}
