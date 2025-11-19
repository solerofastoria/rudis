import { useState, useEffect, useRef } from "react";
import { useChat } from "../../features/chat/hooks/useChat";
import { useAuth } from "../../hooks/useAuth";

const ChatPage = () => {
  const { user } = useAuth();
  const { messages, isConnected, sendMessage } = useChat();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (newMessage.trim() && user) {
      sendMessage(newMessage);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Чат</h1>
      <div style={{ marginBottom: "10px" }}>
        Статус подключения: {isConnected ? "Подключен" : "Отключен"}
      </div>
      
      <div 
        style={{ 
          border: "1px solid #ccc", 
          height: "400px", 
          overflowY: "auto", 
          padding: "10px",
          marginBottom: "10px"
        }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: "10px" }}>
            <strong>{msg.username}:</strong> {msg.content}
            <div style={{ fontSize: "0.8em", color: "#666" }}>
              {new Date(msg.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div style={{ display: "flex" }}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
          style={{ 
            flex: 1, 
            padding: "10px", 
            marginRight: "10px",
            resize: "none"
          }}
          rows={3}
        />
        <button 
          onClick={handleSend}
          disabled={!isConnected || !newMessage.trim()}
          style={{ 
            padding: "10px 20px",
            backgroundColor: isConnected ? "#007bff" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: isConnected ? "pointer" : "not-allowed"
          }}
        >
          Отправить
        </button>
      </div>
    </div>
  );
};

export default ChatPage;