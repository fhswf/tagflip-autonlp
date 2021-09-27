import { Expose } from 'class-transformer';
import { FileInstruction } from './file-instruction.interface';

export interface Split {
  name: string;
  files: FileInstruction[];
}
