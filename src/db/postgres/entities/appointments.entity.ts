import { AppointmentStatus } from './appointment_status.enum';

export interface Appointments {
  id: string;
  personId: string;
  scheduledAt: Date;
  status: AppointmentStatus;
  emails: string[];
  created_at: Date;
  updated_at: Date;
}
