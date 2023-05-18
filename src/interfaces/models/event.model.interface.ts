export interface Event {
  _id: string;
  title: string;
  description: string;
  createdBy: string;
  color: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
