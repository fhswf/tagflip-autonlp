import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, Schema } from '@nestjs/mongoose';
import { DatasetSubset as IDatasetSubset } from 'auto-nlp-shared-js';
import { DownloadConfiguration } from 'auto-nlp-shared-js';
import { Feature } from 'auto-nlp-shared-js';
import { GraphQLObjectID } from 'graphql-scalars';
import * as mongoose from 'mongoose';
import { Split } from './split.entity';

// @Schema()
@ObjectType()
export class DatasetSubset implements IDatasetSubset {
  // @Field(() => GraphQLObjectID, { name: 'id', nullable: true })
  // _id: mongoose.Types.ObjectId;

  @Field()
  // @Prop()
  name: string;

  description?: string;

  version?: string;

  features?: Map<string, Feature>;

  splits?: Map<string, Split>;

  homepage?: string;

  license?: string;

  download?: DownloadConfiguration;

  @Field(() => ID)
  get id() {
    return this.name;
  }

  public static newInstance(
    name?: string,
    description?: string,
  ): DatasetSubset {
    const datasetSubset = new DatasetSubset();
    datasetSubset.name = name;
    datasetSubset.description = description;
    datasetSubset.splits = new Map<string, Split>();
    datasetSubset.features = new Map<string, Feature>();
    return datasetSubset;
  }
}
