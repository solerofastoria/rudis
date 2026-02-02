import apiClient from './client';

export interface Friend {
  id: string;
  username: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
  online: boolean;
  lastSeen: string;
}

export interface FriendRequest {
  id: string;
  userId: string;
  username: string;
}

export const getFriends = async (): Promise<Friend[]> => {
  const response = await apiClient.get('/friends');
  return response.data.data;
};

export const getFriendRequests = async (): Promise<FriendRequest[]> => {
  const response = await apiClient.get('/friends/requests');
  return response.data.data;
};

export const addFriend = async (friendId: string): Promise<void> => {
  await apiClient.post('/friends/add', { friendId });
};

export const acceptFriend = async (friendId: string): Promise<void> => {
  await apiClient.post('/friends/accept', { friendId });
};

export const rejectFriend = async (friendId: string): Promise<void> => {
  await apiClient.post('/friends/reject', { friendId });
};

export const removeFriend = async (friendId: string): Promise<void> => {
  await apiClient.post('/friends/remove', { friendId });
};