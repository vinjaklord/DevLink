import type { IMember } from './member.model';

export interface IMessage {
  _id: string;
  senderId: string;
  recipientId: string;
  text?: string;
  photo?: string;
  createdAt: string;
}
interface ILastMessage {
  senderId: string;
  text: string;
  createdAt: Date;
}

export interface IChatUser extends IMember {
  lastMessage: ILastMessage | null;
}
