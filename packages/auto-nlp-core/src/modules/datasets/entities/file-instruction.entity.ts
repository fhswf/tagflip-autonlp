import { FileInstruction as IFileInstruction } from 'auto-nlp-shared-js';

export class FileInstruction implements IFileInstruction {
  filename: string;
  numberOfExamples?: number;
  skip?: number;
  take?: number;

  constructor(
    filename: string,
    numberOfExamples?: number,
    skip?: number,
    take?: number,
  ) {
    this.filename = filename;
    this.numberOfExamples = numberOfExamples;
    this.skip = skip;
    this.take = take;
  }
}
