import api from './client';

export interface User {
  id: number;
  username: string;
  avatar?: string;
}

// Получение всех пользователей
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data.data || [];
};