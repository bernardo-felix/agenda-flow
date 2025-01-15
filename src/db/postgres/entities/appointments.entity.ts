import { AppointmentStatus } from './appointment_status.enum';

export interface Appointments {
  id: string;
  person_id: string;
  scheduled_at: Date;
  status: AppointmentStatus;
  emails: string[];
  created_at: Date;
  updated_at: Date;
}
