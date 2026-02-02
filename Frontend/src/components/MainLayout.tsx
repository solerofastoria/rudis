import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMessages } from "../features/chat/hooks/useMessages";
import useAuth from "../hooks/useAuth";
import { MessageItem } from "./MessageItem";
import { UserList } from "./UserList";
import { ServerList } from "./ServerList";
import { FriendSearchPage } from "../pages/Main/FriendSearchPage";
import { BottomNavigation } from './BottomNavigation';
import { UserSettings } from "../pages/Settings/UserSettings";

export const MainLayout = () => {
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { messages, isConnected, sendMessage, editMessage, deleteMessage } = useMessages(userId);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  useEffect(() => {
    // Устанавливаем loading в false, так как UserList теперь сам загружает пользователей
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) {
      setSelectedUserId(null);
    }
  }, [userId]);

  const handleSelectUser = (userId: string | null) => {
    setSelectedUserId(userId);
    if (userId) {
      navigate(`/dm/${userId}`);
    } else {
      navigate(`/app/chat`);
    }
  };

  const handleSend = () => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

    // Функция для обновления списка друзей в UserList
    const [friendsUpdateTrigger, setFriendsUpdateTrigger] = useState(0);
    
    const handleUserListFriendsUpdate = () => {
      // Увеличиваем счетчик для триггера обновления
      setFriendsUpdateTrigger(prev => prev + 1);
    };
  
  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Проверяем, если мы на странице поиска друзей
  const isFriendSearchPage = location.pathname === '/app/friends';
  // Проверяем, если мы на странице настроек профиля
  const isProfileSettingsPage = location.pathname === '/app/settings/profile';

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#ffffff", flexDirection: "column" }}>
      {/* Верхняя навигация */}
      <BottomNavigation />
      <div className="main-content">
        {/* Левая панель с серверами и пользователями */}
        <div className="user-list-panel">
          {/* Список серверов */}
          <ServerList />
          
          {/* Разделитель */}
          <div style={{ height: "1px", backgroundColor: "var(--border)", margin: "10px 0" }}></div>
          
          {/* Список пользователей */}
          <UserList
            selectedUserId={selectedUserId || userId || undefined}
            onSelectUser={handleSelectUser}
            onFriendsUpdate={handleUserListFriendsUpdate}
            showFriendsOnly={true}
            key={friendsUpdateTrigger}
          />
        </div>

        {/* Основная область контента */}
        <div className="chat-content">
          {isFriendSearchPage ? (
            // Отображаем страницу поиска друзей вместо чата
            <FriendSearchPage />
          ) : isProfileSettingsPage ? (
            // Отображаем страницу настроек профиля
            <UserSettings />
          ) : (
            // Отображаем обычный чат
            <>
              {/* Заголовок чата */}
              <div className="chat-header">
                <h2>
                  {selectedUserId || userId ? `Личные сообщения` : "Общий чат"}
                </h2>
              </div>
              
              
              {/* Область сообщений */}
              <div className="messages-container">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <MessageItem
                      key={msg.id}
                      message={msg}
                      currentUserId={currentUser?.id || ''}
                      onEdit={editMessage}
                      onDelete={deleteMessage}
                    />
                  ))
                ) : (
                  <div className="no-messages">
                    Нет сообщений. {selectedUserId || userId ? "Начните диалог!" : "Будьте первым, кто напишет!"}
                  </div>
                )}
              </div>
              {/* Поле ввода сообщения */}
              <div className="message-input-area">
                <div className="message-input-container">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKey}
                    rows={3}
                    placeholder="Введите сообщение..."
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!isConnected || !newMessage.trim()}
                    className="send-button"
                  >
                    Отправить
                  </button>
                </div>
                {!isConnected && (
                  <div className="connection-status">
                    Подключение к серверу...
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};