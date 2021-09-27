import { TagAttributes } from '@fhswf/tagflip-common';

export class Tag implements TagAttributes {
  tagId?: number;
  annotationId: number;
  documentId: number;
  annotationTaskId: number;
  startIndex: number;
  endIndex: number;
  createdAt?: Date;
  updatedAt?: Date;
}
