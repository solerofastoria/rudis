import api from './client';
import type { Server, ServerCreateData, ServerCreateResponse } from '../features/servers/types';

// Создание сервера
export const createServer = async (data: ServerCreateData): Promise<ServerCreateResponse> => {
  const formData = new FormData();
  
  formData.append('name', data.name);
  if (data.icon) {
    formData.append('icon', data.icon);
  }
  formData.append('template', data.template || 'default');
  formData.append('region', data.region || 'eu-west');
  formData.append('privacy', data.privacy || 'public');
  
  try {
    const response = await api.post<ServerCreateResponse>('/servers/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Ошибка сети при создании сервера',
      },
    };
  }
};

// Получение списка серверов пользователя
export const getUserServers = async (): Promise<Server[]> => {
  try {
    const response = await api.get<{ servers: Server[] }>('/servers');
    return response.data.servers;
  } catch (error) {
    console.error('Error fetching user servers:', error);
    return [];
  }
};

// Получение информации о сервере
export const getServer = async (serverId: string): Promise<Server | null> => {
  try {
    const response = await api.get<{ server: Server }>(`/servers/${serverId}`);
    return response.data.server;
  } catch (error) {
    console.error('Error fetching server:', error);
    return null;
  }
};

export default {
  createServer,
  getUserServers,
  getServer,
};