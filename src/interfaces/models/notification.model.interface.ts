export interface Notification {
  _id: string;
  receiverId: string;
  senderId: string;
  text: string;
  type: string;
  entityId: string;
  createdAt: Date;
  isReaden: boolean;
}
