export const enum DataType {
  string = 'string',
  list = 'list',
  int64 = 'int64',
}

export interface Feature {
  id: any;
  name: string;
  dtype: DataType;
  type: string;
}
