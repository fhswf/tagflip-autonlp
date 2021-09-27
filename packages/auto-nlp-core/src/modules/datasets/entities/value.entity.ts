import { DataType, Feature } from 'auto-nlp-shared-js';

export class Value implements Feature {
  dtype: DataType;
  id: any;
  name: string;
  type: string = 'Value';

  constructor(name, dtype: DataType, id?: any) {
    this.name = name;
    this.dtype = dtype;
    this.id = id;
  }
}
