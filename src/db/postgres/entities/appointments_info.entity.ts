export interface AppointmentsInfo {
  id: string;
  appointment_id: string;
  subject: string;
  body: string;
  emails: string[];
  created_at: Date;
  updated_at: Date;
}
