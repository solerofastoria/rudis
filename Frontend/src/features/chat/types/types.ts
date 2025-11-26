export interface IMessage {
  id: string;
  content: string;
  senderId: string;
  recipientId?: string;
  username: string;
  timestamp: number;
  isEdited?: boolean;
  editedAt?: number;
  isDirect?: boolean;
  isRead?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITypingUser {
  userId: string;
  username: string;
}

export interface IUser {
  id: string;
  username: string;
  avatar?: string;
  isOnline?: boolean;
}