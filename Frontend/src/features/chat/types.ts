export interface IMessage {
  id: string;
  content: string;
  userId: number;
  username: string;
  timestamp: number;
  chatId?: string;
}

export interface ITypingUser {
  userId: number;
  username: string;
}

export interface IChatState {
  messages: IMessage[];
  typingUsers: ITypingUser[];
  isConnected: boolean;
}