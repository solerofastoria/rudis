import api from './client';

export interface User {
  id: string;
  username: string;
  avatar?: string;
}

// Получение всех пользователей
export const getUsers = async (friendsOnly: boolean = false): Promise<User[]> => {
  const response = await api.get('/users', {
    params: {
      friends: friendsOnly ? 'true' : 'false'
    }
  });
  return response.data.data || [];
};