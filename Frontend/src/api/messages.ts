import api from './client';
import type { IMessage } from '../features/chat/types';

// Получение всех публичных сообщений
export const getMessages = async (): Promise<IMessage[]> => {
  const response = await api.get('/messages');
  return response.data.data || [];
};

// Получение личных сообщений с пользователем
export const getDirectMessages = async (userId: string): Promise<IMessage[]> => {
  const response = await api.get(`/messages/direct/${userId}`);
  return response.data.data || [];
};

// Создание нового сообщения
export const createMessage = async (data: {
  content: string;
  recipientId?: string;
  isDirect?: boolean;
}): Promise<IMessage> => {
  const response = await api.post('/messages', data);
  return response.data.data;
};

// Редактирование сообщения
export const updateMessage = async (id: string, content: string): Promise<IMessage> => {
  const response = await api.put(`/messages/${id}`, { content });
  return response.data.data;
};

// Удаление сообщения
export const deleteMessage = async (id: string): Promise<void> => {
  await api.delete(`/messages/${id}`);
};