import { Split as ISplit } from 'auto-nlp-shared-js';
import { FileInstruction } from './file-instruction.entity';

export class Split implements ISplit {
  name: string;
  files: FileInstruction[];

  constructor(name: string = undefined, files: FileInstruction[] = []) {
    this.name = name;
    this.files = files;
  }
}
