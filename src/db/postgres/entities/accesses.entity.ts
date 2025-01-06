import { GroupType } from './group_type.enum';

export interface Accesses {
  id: string;
  person_id: string;
  group_type: GroupType;
  created_at: Date;
  updated_at: Date;
}
