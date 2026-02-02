import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { CreateServerButton } from './CreateServerButton';
import './BottomNavigation.css';

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');
  const [showServers, setShowServers] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Определяем активную вкладку на основе текущего пути
  useEffect(() => {
    if (location.pathname.includes('/app/friends')) {
      setActiveTab('friends');
    } else if (location.pathname.includes('/app/servers')) {
      setActiveTab('servers');
    } else if (location.pathname.includes('/app/notifications')) {
      setActiveTab('notifications');
    } else {
      setActiveTab('friends');
    }
  }, [location]);

  const handleFriendsClick = () => {
    setActiveTab('friends');
    navigate('/app/chat');
  };

  const handleServersClick = () => {
    setActiveTab('servers');
    setShowServers(!showServers);
  };

  const handleNotificationsClick = () => {
    setActiveTab('notifications');
    navigate('/app/notifications');
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <div className="bottom-navigation">
      {/* Панель серверов (выдвижная) */}
      {showServers && (
        <div className="servers-panel">
          <div className="servers-panel-header">
            <h3>Серверы</h3>
            <button 
              className="servers-panel-close"
              onClick={() => setShowServers(false)}
            >
              ✕
            </button>
          </div>
          <div className="servers-list">
            <div className="server-item">
              <div className="server-avatar">🎮</div>
              <span>Игровой сервер</span>
            </div>
            <div className="server-item">
              <div className="server-avatar">📚</div>
              <span>Образование</span>
            </div>
            <div className="server-item">
              <div className="server-avatar">🎵</div>
              <span>Музыка</span>
            </div>
          </div>
          <div className="create-server-button-container">
            <CreateServerButton />
          </div>
        </div>
      )}

      {/* Основная панель навигации */}
      <div className="navigation-panel">
        <div className="navigation-item" onClick={handleFriendsClick}>
          <div className={`navigation-icon ${activeTab === 'friends' ? 'active' : ''}`}>
            👥
          </div>
          <span className="navigation-label">Друзья</span>
          {activeTab === 'friends' && <div className="active-indicator"></div>}
        </div>

        <div className="navigation-item" onClick={handleServersClick}>
          <div className={`navigation-icon ${activeTab === 'servers' ? 'active' : ''}`}>
            🏛
          </div>
          <span className="navigation-label">Серверы</span>
          {activeTab === 'servers' && <div className="active-indicator"></div>}
        </div>

        <div className="navigation-item" onClick={() => {
          // Открываем модальное окно создания сервера
          const event = new CustomEvent('openCreateServerModal');
          window.dispatchEvent(event);
        }}>
          <div className="navigation-icon">
            +
          </div>
          <span className="navigation-label">Создать</span>
        </div>

        <div className="navigation-item" onClick={handleNotificationsClick}>
          <div className={`navigation-icon ${activeTab === 'notifications' ? 'active' : ''}`}>
            🔔
          </div>
          <span className="navigation-label">Уведомления</span>
          {activeTab === 'notifications' && <div className="active-indicator"></div>}
          <div className="notification-badge">3</div>
        </div>

        <div className="navigation-item" onClick={handleMenuClick}>
          <div className={`navigation-icon ${activeTab === 'menu' ? 'active' : ''}`}>
            ☰
          </div>
          <span className="navigation-label">Меню</span>
          {activeTab === 'menu' && <div className="active-indicator"></div>}
        </div>
      </div>

      {/* Меню (выдвижное) */}
      {showMenu && (
        <div className="menu-panel">
          <div className="menu-header">
            <div className="user-info">
              <div className="user-avatar">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="user-details">
                <div className="username">{user?.username || "Пользователь"}</div>
                <div className="user-status">В сети</div>
              </div>
            </div>
          </div>
          <div className="menu-items">
            <div className="menu-item" onClick={() => {
              navigate('/app/settings/profile');
              setShowMenu(false);
            }}>
              <span>Профиль</span>
            </div>
            <div className="menu-item" onClick={() => {
              navigate('/app/settings');
              setShowMenu(false);
            }}>
              <span>Настройки</span>
            </div>
            <div className="menu-item">
              <span>Стикеры</span>
            </div>
            <div className="menu-item">
              <span>Закладки</span>
            </div>
            <div className="menu-item">
              <span>Помощь</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};