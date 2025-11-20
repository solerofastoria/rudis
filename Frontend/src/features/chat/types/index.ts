export interface IMessage {
  id: string;
  content: string;
  userId: number;
  username: string;
  timestamp: number;
  isEdited?: boolean;
  editedAt?: number;
  isDirect?: boolean;
  recipientId?: number;
  senderId?: string;
  createdAt?: string;
  updatedAt?: string;
}