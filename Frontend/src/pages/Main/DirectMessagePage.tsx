import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useMessages } from "../../features/chat/hooks/useMessages";
import { useAuth } from "../../hooks/useAuth";
import { MessageItem } from "../../components/MessageItem";

const DirectMessagePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { messages, isConnected, sendMessage, editMessage, deleteMessage } = useMessages(userId);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!newMessage.trim() || !userId) return;
    sendMessage(newMessage);
    setNewMessage("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user || !userId) {
    return <div>Ошибка: пользователь не найден</div>;
  }

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column" }}>
      <h1>Личные сообщения</h1>
      <div style={{ marginBottom: 10 }}>
        Статус подключения: {isConnected ? "Подключено" : "Отключено"}
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid #ccc",
          padding: 10,
          overflowY: "auto",
          marginBottom: 10,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div>Всего сообщений: {messages.length}</div>
        {messages.length > 0 ? (
          messages.map((msg) => (
            <MessageItem
              key={msg.id}
              message={msg}
              currentUserId={user.id}
              onEdit={editMessage}
              onDelete={deleteMessage}
            />
          ))
        ) : (
          <div>Нет сообщений</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          style={{ flex: 1, padding: 10 }}
          placeholder="Введите сообщение..."
        />
        <button 
          onClick={handleSend} 
          disabled={!isConnected || !newMessage.trim()}
          style={{ padding: "10px 20px" }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default DirectMessagePage;