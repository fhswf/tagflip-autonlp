import { Operator } from '@fhswf/tagflip-common';
import {
  HttpException,
  HttpService,
  HttpStatus,
  Injectable,
  Logger,
  Scope,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DataType, TaskType } from 'auto-nlp-shared-js';
import { plainToClass } from 'class-transformer';
import * as _ from 'lodash';
import * as path from 'path';
import { DatasetProvider } from '../dataset-provider.abstract';
import { Provider } from '../dataset-provider.decorator';
import { ClassLabel } from '../../entities/class-label.entity';
import { DatasetSubset } from '../../entities/dataset-subset.entity';
import { Dataset } from '../../entities/dataset.entity';

import { FileInstruction } from '../../entities/file-instruction.entity';
import { Sequence } from '../../entities/sequence.entity';
import { Split } from '../../entities/split.entity';
import { Value } from '../../entities/value.entity';
import { DatasetProvidersService } from '../dataset-providers.service';
import { AnnotationSet } from './entities/annotation-set.entity';
import { Annotation } from './entities/annotation.entity';
import { Corpus } from './entities/corpus.entity';
import { Document } from './entities/document.entity';
import { Tag } from './entities/tag.entity';
import { TagFlipDatasetProviderConfig } from './tagflip-dataset-provider.config';

@Injectable({ scope: Scope.TRANSIENT })
@Provider('tagflip')
export class TagFlipDatasetProvider extends DatasetProvider<TagFlipDatasetProviderConfig> {
  private logger: Logger = new Logger(TagFlipDatasetProvider.name);

  constructor(private httpService: HttpService) {
    super();
  }

  getConfigType(): new (...args: any[]) => TagFlipDatasetProviderConfig {
    return TagFlipDatasetProviderConfig;
  }

  async listDatasets(): Promise<Dataset[]> {
    const response = await this.httpService
      .get<[]>(`${this.getConfig().api}/corpus`)
      .toPromise();
    return plainToClass(Corpus, response.data).map((c) =>
      Dataset.newInstance(c.name, [DatasetSubset.newInstance(c.name)]),
    );
  }

  async hasDataset(datasetName: string): Promise<boolean> {
    const corpora = await this.searchDataset(datasetName);

    return corpora.map((c) => c.name).includes(datasetName);
  }

  async getDataset(datasetName: string): Promise<Dataset> {
    const corpora = await this.searchDataset(datasetName);
    let corpus = undefined;
    if (corpora.length > 1) {
      for (const foundCorpus of corpora) {
        if (foundCorpus.name === datasetName) {
          corpus = foundCorpus;
          break;
        }
      }
      if (!corpus)
        throw new HttpException(
          "Corpus name is ambiguous for dataset provider '" +
            this.getName() +
            "' Found: " +
            corpora.map((c) => c.name).join(','),
          HttpStatus.AMBIGUOUS,
        );
    } else {
      corpus = corpora[0];
    }

    const corpusExportUrl: URL = new URL(
      `${this.getConfig().api}/corpus/${corpus.corpusId}/export`,
    );
    corpusExportUrl.searchParams.set('exporterName', 'WebAnno TSV 3.2');
    corpusExportUrl.searchParams.set('iob', 'true');

    const splits = await this.getDatasetSplitFiles(corpus.corpusId, [
      'train',
      'valid',
      'test',
    ]);

    const labelClasses = await this.gatherRelevantAnnotations(
      corpus.corpusId,
      _.flatten(Array.from(splits.values())).map((x) => x.documentId),
    );

    const labels = _.uniq(
      _.flatten(['O', ...labelClasses.map((l) => l.nameAsIOB())]),
    );
    const labelFeature = new Sequence(
      'ner_tags',
      new ClassLabel('ner_tags', DataType.string, labels),
    );

    const nestedlabelFeature = new Sequence(
      'nested_ner_tags',
      new ClassLabel('nested_ner_tags', DataType.string, labels),
    );

    const tokensFeature = new Sequence(
      'tokens',
      new Value('tokens', DataType.string),
    );

    const subset = DatasetSubset.newInstance();
    subset.name = corpus.name;
    subset.description = corpus.description;
    subset.download = { files: [{ url: corpusExportUrl.toString() }] };
    // append labels to dataset
    subset.features.set(labelFeature.name, labelFeature);
    subset.features.set(nestedlabelFeature.name, nestedlabelFeature);
    subset.features.set(tokensFeature.name, tokensFeature);

    // append splits to dataset
    splits.forEach((documents, name) =>
      subset.splits.set(
        name,
        new Split(
          name,
          documents.map((d) => new FileInstruction(d.filename)),
        ),
      ),
    );

    return Dataset.newInstance(corpus.name, [subset]);
  }

  /**
   * Returns the files of the corpus splitted by given split names.
   * @param {number} corpusId the id of the corpus
   * @param {string[]} splits the name of the splits
   * @returns {Promise<Map<string, Document[]>>}
   * @private
   */
  private async getDatasetSplitFiles(
    corpusId: number,
    splits: string[],
  ): Promise<Map<string, Document[]>> {
    const response = await this.httpService
      .get<[]>(`${this.getConfig().api}/corpus/${corpusId}/document`)
      .toPromise();
    const documents = plainToClass(Document, response.data);

    const splitMap = new Map<string, Document[]>();
    for (const split of splits) {
      splitMap.set(split, []);
      for (const document of documents) {
        const fileBasename = path.parse(document.filename).name.toLowerCase();
        if (fileBasename.endsWith(split.toLowerCase())) {
          splitMap.get(split).push(document);
        }
      }
    }

    return splitMap;
  }

  /**
   * Searches for a dataset by name.
   * @param {string} datasetName the name of the dataset
   * @returns {Promise<Corpus[]>}
   * @private
   */
  private async searchDataset(datasetName: string): Promise<Corpus[]> {
    const searchFilter = JSON.stringify([
      {
        field: 'name',
        operator: Operator.STARTS_WITH,
        filterValue: datasetName,
      },
    ]);
    const response = await this.httpService
      .get<Corpus[]>(`${this.getConfig().api}/corpus`, {
        params: { searchFilter },
      })
      .toPromise();

    return plainToClass(Corpus, response.data);
  }

  public async gatherRelevantAnnotations(
    corpusId: number,
    documentIds: number[],
  ): Promise<Annotation[]> {
    // take annotation ids from related documents
    const annotationIds: Set<number> = new Set();
    for (const documentId of documentIds) {
      const tags = plainToClass(
        Tag,
        (
          await this.httpService
            .get<[]>(`${this.getConfig().api}/document/${documentId}/tag`)
            .toPromise()
        ).data,
      );
      tags.forEach((t) => annotationIds.add(t.annotationId));
    }

    // take annotationssets assigned to the corpus
    const corpusAnnotationSets: AnnotationSet[] = plainToClass(
      AnnotationSet,
      (
        await this.httpService
          .get<[]>(`${this.getConfig().api}/corpus/${corpusId}/annotationset`)
          .toPromise()
      ).data,
    );

    if (corpusAnnotationSets.length == 0 && annotationIds.size > 0) {
      throw new UnprocessableEntityException(
        'Corpus has no Annotation Sets selected, but Tags were found. Unable to match Tags to Annotations. Select Annotation Sets...',
      );
    }

    const annotationNames: Map<number, Annotation> = new Map();
    // filter relevant annotations by annotation id
    for (const corpusAnnotationSet of corpusAnnotationSets) {
      const annotations: Annotation[] = plainToClass(
        Annotation,
        (
          await this.httpService
            .get<[]>(
              `${this.getConfig().api}/annotationset/${
                corpusAnnotationSet.annotationSetId
              }/annotation`,
            )
            .toPromise()
        ).data,
      );
      annotations.forEach((a) => annotationNames.set(a.annotationId, a));
    }

    return Array.from(annotationNames.values());
  }

  listDatasetsByTask(task: TaskType): Promise<Dataset[]> {
    //TODO: since tagflip ony supports NER, we dont have to distinguish for now.
    return this.listDatasets();
  }
}
