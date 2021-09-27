export interface FileInstruction {
  filename: string;
  numberOfExamples?: number;
  skip?: number;
  take?: number;
}
