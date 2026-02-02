import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../hooks/useSocket';
import { MessageItem } from '../../components/MessageItem';
import { MessageEditor } from '../../components/MessageEditor';
import './ServerPage.css';
import type { IMessage } from '../../features/chat/types/types';

export const ChannelPage = () => {
  const { serverId, channelId } = useParams<{ serverId: string; channelId: string }>();
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const { socket, isConnected, emit, on } = useSocket();
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Присоединяемся к комнате канала
    emit('channel:join', { serverId, channelId });

    // Получаем историю сообщений
    emit('channel:history', { serverId, channelId });

    // Слушаем новые сообщения
    const offMessage = on('channel:message', (message: IMessage) => {
      setMessages(prev => [...prev, message]);
    });

    // Слушаем редактирование сообщений
    const offUpdate = on('message:updated', (message: IMessage) => {
      setMessages(prev =>
        prev.map(msg => msg.id === message.id ? message : msg)
      );
    });

    // Слушаем удаление сообщений
    const offDelete = on('message:deleted', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    });

    // Сохраняем функции отписки
    setUnsubscribe(() => () => {
      offMessage?.();
      offUpdate?.();
      offDelete?.();
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      emit('channel:leave', { serverId, channelId });
    };
  }, [socket, isConnected, serverId, channelId, emit, on, unsubscribe]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !isConnected) return;

    emit('channel:send', {
      serverId,
      channelId,
      content: newMessage.trim()
    });

    setNewMessage('');
  };

  const handleEditMessage = (messageId: string, content: string) => {
    if (!socket || !isConnected) return;
    
    emit('message:edit', {
      messageId,
      content
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!socket || !isConnected) return;
    
    emit('message:delete', {
      messageId
    });
  };

  return (
    <div className="channel-page">
      <div className="messages-container">
        {messages.map(message => (
          <MessageItem
            key={message.id}
            message={message}
            currentUserId="current-user-id" // В реальном приложении здесь будет ID текущего пользователя
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
          />
        ))}
      </div>
      
      <MessageEditor
        initialValue={newMessage}
        onSave={handleSendMessage}
        onCancel={() => {}}
        placeholder="Введите сообщение..."
      />
    </div>
  );
};