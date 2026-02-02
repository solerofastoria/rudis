import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMessages } from "../features/chat/hooks/useMessages";
import useAuth from "../hooks/useAuth";
import { MessageItem } from "./MessageItem";
import { UserList } from "./UserList";
import { FriendSearchPage } from "../pages/Main/FriendSearchPage";
import { BottomNavigation } from "./BottomNavigation";
import './ChatLayout.css';

export const ChatLayout = () => {
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

  return (
    <div className="chat-layout">
      {/* Верхняя навигация */}
      <BottomNavigation />
      <div className="main-content">
        {/* Список пользователей */}
        <div className="user-list-panel">
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
        
        {/* Правая панель участников */}
        <div className="participants-panel">
          <div className="participants-header">
            <h3>Участники</h3>
          </div>
          <div className="participants-list">
            <div className="participant-item">
              <div className="participant-avatar online">А</div>
              <div className="participant-info">
                <div className="participant-name">Алексей</div>
                <div className="participant-status">В сети</div>
              </div>
            </div>
            <div className="participant-item">
              <div className="participant-avatar online">М</div>
              <div className="participant-info">
                <div className="participant-name">Мария</div>
                <div className="participant-status">В сети</div>
              </div>
            </div>
            <div className="participant-item">
              <div className="participant-avatar">Д</div>
              <div className="participant-info">
                <div className="participant-name">Дмитрий</div>
                <div className="participant-status">Не в сети</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};