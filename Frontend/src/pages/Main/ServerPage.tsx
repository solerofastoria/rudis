import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getServer } from '../../api/servers';
import { AuthContext } from '../../context/AuthContext';
import './ServerPage.css';

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
}

interface Server {
  id: string;
  name: string;
  icon_url?: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
  channels: Channel[];
}

export const ServerPage = () => {
  const { serverId } = useParams<{ serverId: string }>();
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("ServerPage must be used within an AuthProvider");
  }
  const { user } = context;
  const [server, setServer] = useState<Server | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  useEffect(() => {
    const fetchServer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!serverId) {
          throw new Error('ID сервера не указан');
        }
        
        const response = await getServer(serverId);
        
        if (response) {
          setServer(response);
          
          // Выбираем первый текстовый канал по умолчанию
          const firstTextChannel = response.channels.find(ch => ch.type === 'text');
          if (firstTextChannel) {
            setSelectedChannel(firstTextChannel.id);
            // Навигация к первому каналу
            navigate(`/app/servers/${serverId}/channel/${firstTextChannel.id}`, { replace: true });
          }
        } else {
          throw new Error('Сервер не найден');
        }
      } catch (err: any) {
        console.error('Ошибка при загрузке сервера:', err);
        setError(err.message || 'Ошибка при загрузке сервера');
      } finally {
        setLoading(false);
      }
    };
    
    if (serverId && user) {
      fetchServer();
    }
  }, [serverId, user, navigate]);

  if (loading) {
    return (
      <div className="server-page">
        <div className="loading">Загрузка сервера...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="server-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="server-page">
        <div className="error">Сервер не найден</div>
      </div>
    );
  }

  return (
    <div className="server-page">
      <div className="server-header">
        <h1>{server.name}</h1>
        <div className="server-info">
          <p>Код приглашения: {server.invite_code}</p>
          <p>Каналов: {server.channels.length}</p>
        </div>
      </div>
      
      <div className="channels-list">
        <h2>Каналы</h2>
        <ul>
          {server.channels.map(channel => (
            <li 
              key={channel.id} 
              className={`channel-item ${selectedChannel === channel.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedChannel(channel.id);
                navigate(`/app/servers/${serverId}/channel/${channel.id}`);
              }}
            >
              <span className="channel-name">
                {channel.type === 'voice' ? '🔊' : '💬'} {channel.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};