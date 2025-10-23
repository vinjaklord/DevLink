import type { IMember } from './member.model.ts';

export interface INotification {
  _id: string;
  targetUser: string;
  fromUser: IMember | null;
  type: 'like' | 'comment' | 'friend_request' | 'friend_accept';
  message: string; 
  relatedPost?: string;
  isRead: boolean;
  createdAt: string;         
  updatedAt?: string;
}
