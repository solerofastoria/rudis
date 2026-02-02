import { useState, memo, useMemo } from 'react';
import { MessageEditor } from './MessageEditor';
import { Button } from './ui/Button/Button';
import './MessageItem.css';
import type { IMessage } from '../features/chat/types/types';

interface MessageItemProps {
  message: IMessage;
  currentUserId: string;
  onEdit: (messageId: string, content: string) => void;
  onDelete: (messageId: string) => void;
}

export const MessageItem = memo(({
  message,
  currentUserId,
  onEdit,
  onDelete
}: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  
  // Мемоизация вычисляемых значений
  const { isOwnMessage, messageTime, editedTime } = useMemo(() => {
    // Если timestamp приходит как строка, преобразуем её в число
    const timestamp = typeof message.timestamp === 'string' ?
      new Date(message.timestamp).getTime() :
      message.timestamp;
      
    const isOwnMessage = message.senderId === currentUserId;
    const messageTime = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const editedTime = message.editedAt ? new Date(message.editedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    
    return { isOwnMessage, messageTime, editedTime };
  }, [message, currentUserId]);

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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Редактировать
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDelete}
          >
            Удалить
          </Button>
        </div>
      )}
    </div>
  );
});

// Добавляем функцию для оптимизации ререндеринга
export const arePropsEqual = (prevProps: MessageItemProps, nextProps: MessageItemProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.timestamp === nextProps.message.timestamp &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.message.editedAt === nextProps.message.editedAt &&
    prevProps.message.username === nextProps.message.username &&
    prevProps.currentUserId === nextProps.currentUserId
  );
};

// Экспортируем мемоизированный компонент с кастомной функцией сравнения
export default memo(MessageItem, arePropsEqual);