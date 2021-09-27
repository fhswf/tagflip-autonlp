import { TaskType } from '../task-types';
import { ModelScript } from './model-script.interface';

export interface Profile {
  name: string;
  taskType: TaskType;
  description: string;
  defaultTrainingMinutes: number;
  script: ModelScript;
}
