import { DataType, Feature } from 'auto-nlp-shared-js';

export class Sequence implements Feature {
  id: any;
  name: string;
  dtype: DataType;
  type: string;
  private feature: Feature;

  constructor(name, feature: Feature, id?: any) {
    this.name = name;
    this.dtype = DataType.list;
    this.type = 'Sequence';
    this.feature = feature;
    this.id = id;
  }
}
