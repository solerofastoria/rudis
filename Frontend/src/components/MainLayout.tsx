import { useState, useEffect } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import { getUsers } from '../api/users';
import type { User } from '../api/users';
import { useMessages } from "../features/chat/hooks/useMessages";
import { useAuth } from "../hooks/useAuth";
import { MessageItem } from "./MessageItem";

export const MainLayout = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { messages, isConnected, sendMessage, editMessage, deleteMessage } = useMessages(userId);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const [showAllChatsTooltip, setShowAllChatsTooltip] = useState(false);
  const [showCreateServerTooltip, setShowCreateServerTooltip] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
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

  const handleCreateServer = () => {
    console.log('Создание сервера - функция будет реализована позже');
    // Здесь будет логика создания сервера
  };

  const handleShowAllChats = () => {
    // Переход к общему чату
    handleSelectUser(null);
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#ffffff", flexDirection: "column" }}>
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Список пользователей */}
        <div style={{ width: "250px", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "15px", flex: 1, display: "flex", flexDirection: "column" }}>
            <h3>Чаты</h3>
            <ul style={{ 
              listStyle: "none", 
              padding: 0, 
              margin: 0, 
              flex: 1, 
              overflowY: "auto" 
            }}>
              <li 
                style={{ 
                  padding: "8px 12px", 
                  cursor: "pointer", 
                  borderRadius: "4px", 
                  marginBottom: "4px",
                  backgroundColor: !selectedUserId ? "#007bff" : "transparent",
                  color: !selectedUserId ? "white" : "inherit"
                }}
                onClick={() => handleSelectUser(null)}
              >
                🌐 Общий чат
              </li>
              {users.map(user => (
                <li 
                  key={user.id}
                  style={{ 
                    padding: "8px 12px", 
                    cursor: "pointer", 
                    borderRadius: "4px", 
                    marginBottom: "4px",
                    backgroundColor: selectedUserId === String(user.id) ? "#007bff" : "transparent",
                    color: selectedUserId === String(user.id) ? "white" : "inherit"
                  }}
                  onClick={() => handleSelectUser(String(user.id))}
                >
                  {user.username}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Основная область чата */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Заголовок чата */}
          <div style={{
            padding: "15px 20px",
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa",
            display: "flex",
            alignItems: "center"
          }}>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              {selectedUserId || userId ? `Личные сообщения` : "Общий чат"}
            </h2>
          </div>
          
          {/* Область сообщений */}
          <div
            style={{
              flex: 1,
              padding: 10,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
            }}
          >
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
              <div style={{ 
                textAlign: "center", 
                color: "#6c757d", 
                marginTop: "20px",
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                Нет сообщений. {selectedUserId || userId ? "Начните диалог!" : "Будьте первым, кто напишет!"}
              </div>
            )}
          </div>

          {/* Поле ввода сообщения */}
          <div style={{ 
            padding: "15px", 
            borderTop: "1px solid #e0e0e0",
            backgroundColor: "#f8f9fa"
          }}>
            <div style={{ display: "flex", gap: 10 }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKey}
                rows={3}
                style={{ 
                  flex: 1, 
                  padding: "10px", 
                  border: "1px solid #ced4da",
                  borderRadius: "4px",
                  resize: "none",
                  fontFamily: "inherit"
                }}
                placeholder="Введите сообщение..."
                disabled={!isConnected}
              />
              <button 
                onClick={handleSend} 
                disabled={!isConnected || !newMessage.trim()}
                style={{ 
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isConnected && newMessage.trim() ? "pointer" : "not-allowed",
                  opacity: isConnected && newMessage.trim() ? 1 : 0.5
                }}
              >
                Отправить
              </button>
            </div>
            {!isConnected && (
              <div style={{ 
                marginTop: "10px", 
                fontSize: "12px", 
                color: "#6c757d",
                textAlign: "center"
              }}>
                Подключение к серверу...
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Пагинация с информацией о пользователе и кнопками */}
      <div style={{ 
        padding: "15px", 
        borderTop: "1px solid #e0e0e0",
        backgroundColor: "#f8f9fa",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
      }}>
        {/* Информация о пользователе */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Аватарка */}
          <div style={{ 
            width: "40px", 
            height: "40px", 
            borderRadius: "50%", 
            backgroundColor: "#007bff", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
            {currentUser?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          
          {/* Имя пользователя и статус */}
          <div>
            <div style={{ fontWeight: "bold", fontSize: "14px" }}>
              {currentUser?.username || "Пользователь"}
            </div>
            <div style={{ fontSize: "12px", color: isConnected ? "#28a745" : "#6c757d" }}>
              {isConnected ? "В сети" : "Не в сети"}
            </div>
          </div>
        </div>
        
        {/* Кнопки */}
        <div style={{ display: "flex", gap: "10px", position: "relative" }}>
          {/* Круглая кнопка "Все чаты" с tooltip */}
          <div style={{ position: "relative" }}>
            <button 
              onClick={handleShowAllChats}
              onMouseEnter={() => setShowAllChatsTooltip(true)}
              onMouseLeave={() => setShowAllChatsTooltip(false)}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#218838";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#28a745";
              }}
            >
              💬
            </button>
            
            {/* Tooltip для кнопки "Все чаты" */}
            {showAllChatsTooltip && (
              <div style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "8px",
                whiteSpace: "nowrap",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
              }}>
                Все чаты
              </div>
            )}
          </div>
          
          {/* Круглая кнопка создания сервера с tooltip */}
          <div style={{ position: "relative" }}>
            <button 
              className="create-server-button"
              onClick={handleCreateServer}
              onMouseEnter={() => setShowCreateServerTooltip(true)}
              onMouseLeave={() => setShowCreateServerTooltip(false)}
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "24px",
                fontWeight: "bold",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "scale(1.1)";
                e.currentTarget.style.backgroundColor = "#0056b3";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.backgroundColor = "#007bff";
              }}
            >
              +
            </button>
            
            {/* Tooltip для кнопки создания сервера */}
            {showCreateServerTooltip && (
              <div style={{
                position: "absolute",
                bottom: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "14px",
                marginBottom: "8px",
                whiteSpace: "nowrap",
                zIndex: 1000,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)"
              }}>
                Создать сервер
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;