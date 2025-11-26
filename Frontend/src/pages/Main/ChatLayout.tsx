import { useNavigate, useParams } from "react-router-dom";
import { UserList } from "../../components";
import ChatPage from "./ChatPage";
import DirectMessagePage from "./DirectMessagePage";
import { useState, useEffect } from "react";

export const ChatLayout = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);

  // Сброс выбранного пользователя при переходе в общий чат
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

  return (
    <div style={{ display: "flex", height: "100%", backgroundColor: "#ffffff" }}>
      <div style={{ width: "250px", borderRight: "1px solid #e0e0e0" }}>
        <UserList
          selectedUserId={selectedUserId || userId || undefined}
          onSelectUser={handleSelectUser}
        />
      </div>
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
        <div style={{ flex: 1, overflow: "hidden" }}>
          {selectedUserId || userId ? (
            <DirectMessagePage />
          ) : (
            <ChatPage />
          )}
        </div>
      </div>
    </div>
  );
};