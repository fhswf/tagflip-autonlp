import {
  AnnotationSetAttributes,
  CorpusAttributes,
} from '@fhswf/tagflip-common';

export class Corpus implements CorpusAttributes {
  corpusId: number;
  name: string;
  description: string;
  annotationSets: AnnotationSetAttributes[];
  createdAt: Date;
  updatedAt: Date;
}
