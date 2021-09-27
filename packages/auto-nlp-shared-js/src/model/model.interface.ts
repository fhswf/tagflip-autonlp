import { ModelMeta } from './model-meta.interface';
import { Profile } from './profile.interface';

export interface Model {
  id?: string;
  name: string;
  meta?: ModelMeta;
  languages: string[];
  profiles: Profile[];
}
