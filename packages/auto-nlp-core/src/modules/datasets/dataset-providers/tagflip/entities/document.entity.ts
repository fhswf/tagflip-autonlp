import {
  AnnotationTaskDocumentAttributes,
  DocumentAttributes,
} from '@fhswf/tagflip-common';

export class Document implements DocumentAttributes {
  documentId: number;
  corpusId: number;
  filename: string;
  documentHash: string;
  content?: string;
  annotationTaskDocuments?: AnnotationTaskDocumentAttributes[];
  createdAt?: Date;
  updatedAt?: Date;
}
