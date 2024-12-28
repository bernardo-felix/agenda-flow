export interface AppointmentsInfo {
  id: string;
  appointmentId: string;
  emailTitle: string;
  emailBody: string;
  emails: string[];
  rabbitQueueId: string;
  createdAt: Date;
  updatedAt: Date;
}
