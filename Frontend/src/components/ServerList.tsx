import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserServers } from '../api/servers';
import type { Server } from '../features/servers/types';
import { CreateServerButton } from './CreateServerButton';
import './ServerList.css';

interface ServerListProps {
  selectedServerId?: string;
  onSelectServer?: (serverId: string | null) => void;
}

export const ServerList = ({ selectedServerId, onSelectServer }: ServerListProps) => {
  const navigate = useNavigate();
  const [servers, setServers] = useState<Server[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServers = async () => {
    try {
      const serverList = await getUserServers();
      setServers(serverList);
    } catch (error) {
      console.error('Error fetching servers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
    
    // Обновляем список серверов каждые 30 секунд
    const interval = setInterval(fetchServers, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Добавляем эффект для обновления списка серверов при необходимости
  useEffect(() => {
    const handleServerCreated = () => {
      // Небольшая задержка для уверенности, что сервер был создан в БД
      setTimeout(() => {
        fetchServers();
      }, 1000);
    };

    // Слушаем событие создания сервера
    window.addEventListener('serverCreated', handleServerCreated);
    
    return () => {
      window.removeEventListener('serverCreated', handleServerCreated);
    };
  }, []);

  const handleServerSelect = (serverId: string) => {
    onSelectServer?.(serverId);
    navigate(`/app/servers/${serverId}`);
  };

  const handleCreateServer = () => {
    // Обновляем список серверов после создания нового
    fetchServers();
  };

  if (loading) {
    return <div className="server-list">Загрузка серверов...</div>;
  }

  return (
    <div className="server-list">
      <div className="server-list-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Серверы</h3>
          <CreateServerButton onServerCreated={handleCreateServer} />
        </div>
        <ul>
          {servers.map(server => (
            <li
              key={server.id}
              className={`server-item ${selectedServerId === server.id ? 'selected' : ''}`}
              onClick={() => handleServerSelect(server.id)}
              title={server.name}
            >
              <div className="server-icon">
                {server.name.charAt(0).toUpperCase()}
              </div>
              <span className="server-name">{server.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ServerList;