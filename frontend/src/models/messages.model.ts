export interface IMessage {
  _id: string;
  senderId: string;
  recipientId: string;
  text?: string;
  photo?: string;
  createdAt: string;
}
