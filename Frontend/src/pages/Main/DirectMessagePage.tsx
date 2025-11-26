import { useState, useEffect, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../../features/chat/hooks/useMessages";
import { useAuth } from "../../hooks/useAuth";
import { MessageItem } from "../../components/MessageItem";

const DirectMessagePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const { messages, isConnected, sendMessage, editMessage, deleteMessage } = useMessages(userId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  console.log("💬 Текущие DM сообщения:", messages);

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

  // Мемоизация списка сообщений
  const memoizedMessages = useMemo(() => {
    return messages.map((msg) => (
      <MessageItem
        key={msg.id}
        message={msg}
        currentUserId={currentUser?.id || ''}
        onEdit={editMessage}
        onDelete={deleteMessage}
      />
    ));
  }, [messages, currentUser?.id, editMessage, deleteMessage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!currentUser || !userId) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Заголовок */}
      <div style={{ 
        padding: "15px", 
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        gap: 10
      }}>
        <div style={{ 
          width: 30, 
          height: 30, 
          borderRadius: "50%",
          backgroundColor: "#007bff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold"
        }}>
          U
        </div>
        <div>
          <div style={{ fontWeight: "bold" }}>
            Пользователь
          </div>
          <div style={{ fontSize: "12px", color: "#6c757d" }}>
            {isConnected ? "В сети" : "Не в сети"}
          </div>
        </div>
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
          memoizedMessages
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
            Нет сообщений. Начните диалог!
          </div>
        )}
        <div ref={messagesEndRef} />
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
  );
};

export default DirectMessagePage;