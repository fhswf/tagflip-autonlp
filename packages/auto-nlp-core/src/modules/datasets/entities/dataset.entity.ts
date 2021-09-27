import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Dataset as IDataset } from 'auto-nlp-shared-js';
import { Document } from 'mongoose';
import { DatasetSubset } from './dataset-subset.entity';

// @Schema({ timestamps: true })
@ObjectType()
export class Dataset implements IDataset {
  // @Field(() => GraphQLObjectID, { name: 'id', nullable: true })
  // _id?: mongoose.Types.ObjectId;

  @Field()
  @Prop({ unique: true })
  name: string;

  @Field(() => [DatasetSubset])
  subsets?: DatasetSubset[];

  @Field()
  // @Prop()
  providerName?: string;

  // @Prop()
  providerType?: string;

  @Field(() => ID)
  get id() {
    return this.name;
  }

  public static newInstance(name?: string, subsets?: DatasetSubset[]): Dataset {
    const dataset = new Dataset();
    dataset.name = name;
    dataset.subsets = subsets;
    return dataset;
  }
}

export type DatasetDocument = Dataset & Document;
export const DatasetSchema = SchemaFactory.createForClass(Dataset);
