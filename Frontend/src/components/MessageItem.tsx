import { useState } from 'react';
import { MessageEditor } from './MessageEditor';

interface IMessage {
  id: string;
  content: string;
  userId: number;
  username: string;
  timestamp: number;
  isEdited?: boolean;
  editedAt?: number;
}

interface MessageItemProps {
  message: IMessage;
  currentUserId: number;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageItem = ({
  message,
  currentUserId,
  onEdit,
  onDelete
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  // Если timestamp приходит как строка, преобразуем её в число
  const timestamp = typeof message.timestamp === 'string' ?
    new Date(message.timestamp).getTime() :
    message.timestamp;
    
  const isOwnMessage = message.userId === currentUserId || (message as any).senderId === currentUserId;
  const messageTime = new Date(timestamp).toLocaleTimeString();
  const editedTime = message.editedAt ? new Date(message.editedAt).toLocaleTimeString() : '';

  const handleEdit = (content: string) => {
    onEdit(message.id, content);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Вы уверены, что хотите удалить это сообщение?')) {
      onDelete(message.id);
    }
  };

  return (
    <div className={`message-item ${isOwnMessage ? 'own-message' : ''}`}>
      <div className="message-header">
        <span className="message-username">{message.username}</span>
        <span className="message-time">{messageTime}</span>
      </div>
      
      {isEditing ? (
        <MessageEditor
          initialValue={message.content}
          onSave={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="message-content">
          <div className="message-text">{message.content}</div>
          {message.isEdited && (
            <div className="message-edited">(редактировано {editedTime})</div>
          )}
        </div>
      )}
      
      {isOwnMessage && !isEditing && (
        <div className="message-actions">
          <button 
            onClick={() => setIsEditing(true)}
            className="edit-button"
          >
            Редактировать
          </button>
          <button 
            onClick={handleDelete}
            className="delete-button"
          >
            Удалить
          </button>
        </div>
      )}
    </div>
  );
};