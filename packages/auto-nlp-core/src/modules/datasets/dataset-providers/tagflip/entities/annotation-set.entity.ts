import { AnnotationSetAttributes } from '@fhswf/tagflip-common';

export class AnnotationSet implements AnnotationSetAttributes {
  annotationSetId: number;
  createdAt: Date;
  description: string;
  name: string;
  updatedAt: Date;
}
