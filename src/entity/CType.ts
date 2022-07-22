import { EntityModel } from '@midwayjs/typegoose';
import { modelOptions, prop, Severity } from '@typegoose/typegoose';

@EntityModel()
@modelOptions({
  schemaOptions: { collection: 'ctypes' },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class CType {
  @prop()
  metadata: IMetadata;
  @prop()
  ctypeHash: string;
  @prop()
  owner: string;
  @prop()
  description: string;
}

interface IMetadata {
  title: string;
  owner: string;
  description?: IMultilangLabel;
  properties: IMetadataProperties;
}

declare type IMetadataProperties = {
  [key: string]: IMultilangLabel;
};

interface IMultilangLabel {
  default: string;

  [key: string]: string;
}
