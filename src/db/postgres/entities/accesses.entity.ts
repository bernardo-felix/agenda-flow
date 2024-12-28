import { GroupType } from './group_type.enum';

export interface Accesses {
  id: string;
  personId: string;
  groupType: GroupType;
  createdAt: Date;
  updatedAt: Date;
}
