import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../api/users';
import { getFriendRequests, acceptFriend, rejectFriend } from '../api/friends';
import type { User } from '../api/users';
import type { FriendRequest } from '../api/friends';
import { Button } from './ui/Button/Button';
import './UserList.css';

interface UserListProps {
  selectedUserId?: string;
  onSelectUser?: (userId: string | null) => void;
  onFriendsUpdate?: () => void;
  showFriendsOnly?: boolean;
}
export const UserList = ({ selectedUserId, onSelectUser, onFriendsUpdate, showFriendsOnly = false }: UserListProps) => {

  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  const fetchUsersAndFriends = async () => {
    try {
      // Загружаем всех пользователей
      const allUsers = await getUsers(false);
      setUsers(allUsers);
      
      // Загружаем друзей
      try {
        const friendsList = await getUsers(true);
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
      
      // Загружаем входящие запросы дружбы
      try {
        const requests = await getFriendRequests();
        setFriendRequests(requests);
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndFriends();
    
    // Обновляем список друзей каждые 30 секунд
    const interval = setInterval(fetchUsersAndFriends, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Вызываем обновление списка друзей при необходимости
  useEffect(() => {
    fetchUsersAndFriends();
  }, [onFriendsUpdate]);

  // Определяем, какие пользователи должны отображаться
  const displayedUsers = useMemo(() => {
    if (showFriendsOnly) {
      console.log('Displaying friends only:', friends);
      return friends;
    }
    console.log('Displaying all users:', users);
    return users;
  }, [users, friends, showFriendsOnly]);

  // Мемоизация списка пользователей
  const memoizedUserList = useMemo(() => {
    console.log('Rendering user list:', displayedUsers);
    return displayedUsers.map(user => (
      <li
        key={user.id}
        className={selectedUserId === String(user.id) ? 'selected' : ''}
        onClick={() => onSelectUser?.(String(user.id))}
      >
        {user.username}
      </li>
    ));
  }, [displayedUsers, selectedUserId, onSelectUser]);

  // Обработчик принятия запроса дружбы
  const handleAcceptFriend = async (userId: string) => {
    try {
      await acceptFriend(userId);
      // Обновляем список друзей и запросов
      fetchUsersAndFriends();
      // Вызываем обновление в родительском компоненте
      if (onFriendsUpdate) {
        onFriendsUpdate();
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Ошибка при принятии запроса дружбы');
    }
  };

  // Обработчик отклонения запроса дружбы
  const handleRejectFriend = async (userId: string) => {
    try {
      await rejectFriend(userId);
      // Обновляем список друзей и запросов
      fetchUsersAndFriends();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Ошибка при отклонении запроса дружбы');
    }
  };

  // Обработчик перехода на страницу поиска друзей
  const handleFriendSearch = () => {
    navigate('/app/friends');
  };

  if (loading) {
    return <div className="user-list">Загрузка пользователей...</div>;
  }

  return (
    <div className="user-list">
      <div className="user-list-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <h3>Друзья</h3>
        </div>
        <ul>
          <li
            className={!selectedUserId ? 'selected' : ''}
            onClick={() => onSelectUser?.(null)}
          >
            🌐 Общий чат
          </li>
          <li
            onClick={handleFriendSearch}
            style={{ cursor: 'pointer', color: '#007bff', fontWeight: '500' }}
          >
            🔍 Поиск друзей
          </li>
          {memoizedUserList}
        </ul>
        
        {/* Отображаем входящие запросы дружбы */}
        {friendRequests.length > 0 && (
          <div>
            <h4>Запросы в друзья</h4>
            <ul>
              {friendRequests.map(request => (
                <li key={request.id} className="friend-request-item">
                  <span>{request.username}</span>
                  <div className="friend-request-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleAcceptFriend(request.userId)}
                    >
                      Принять
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectFriend(request.userId)}
                    >
                      Отклонить
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;