import { DataType, Feature } from 'auto-nlp-shared-js';

export class ClassLabel implements Feature {
  id: any;
  name: string;
  dtype: DataType;
  type: string;
  names: string[];

  constructor(name: string, dtype: DataType, names: string[], id?: any) {
    this.name = name;
    this.dtype = dtype;
    this.type = 'ClassLabel';
    this.names = names;
    this.id = id;
  }
}
