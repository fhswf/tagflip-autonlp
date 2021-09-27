import { AnnotationAttributes } from '@fhswf/tagflip-common';

export class Annotation implements AnnotationAttributes {
  annotationId: number;
  annotationSetId: number;
  color: string;
  createdAt: Date;
  name: string;
  updatedAt: Date;

  public nameAsIOB(): [string, string] {
    return ['B-' + this.name, 'I-' + this.name];
  }
}
