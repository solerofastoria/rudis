import { useState, useEffect } from 'react';
import { getUsers } from '../api/users';
import { addFriend, getFriendRequests, acceptFriend, rejectFriend } from '../api/friends';
import type { User } from '../api/users';
import type { FriendRequest } from '../api/friends';
import { Input } from '../components/ui/Input/Input';
import { Button } from '../components/ui/Button/Button';
import './FriendSearch.css';

export const FriendSearch = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  // Загрузка пользователей и запросов дружбы
  useEffect(() => {
    fetchUsersAndRequests();
  }, []);

  // Фильтрация пользователей при изменении поискового запроса
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchTerm, users]);

  const fetchUsersAndRequests = async () => {
    setLoading(true);
    try {
      // Загружаем всех пользователей
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      
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

  const handleAddFriend = async (userId: string) => {
    try {
      await addFriend(userId);
      // Добавляем пользователя в список добавленных друзей
      setAddedFriends(prev => new Set(prev).add(userId));
      
      // Обновляем список пользователей и запросов
      fetchUsersAndRequests();
    } catch (error: any) {
      console.error('Error adding friend:', error);
      // Проверяем, является ли ошибка связанной с тем, что пользователь уже в друзьях
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Ошибка при добавлении в друзья');
      }
    }
  };

  const handleAcceptFriend = async (requestId: string) => {
    try {
      await acceptFriend(requestId);
      // Обновляем список пользователей и запросов
      fetchUsersAndRequests();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      alert('Ошибка при принятии запроса дружбы');
    }
  };

  const handleRejectFriend = async (requestId: string) => {
    try {
      await rejectFriend(requestId);
      // Обновляем список пользователей и запросов
      fetchUsersAndRequests();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      alert('Ошибка при отклонении запроса дружбы');
    }
  };

  return (
    <div className="friend-search">
      <div className="friend-search-input-container">
        <Input
          type="text"
          placeholder="Введите имя пользователя..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {loading ? (
        <div className="friend-search-loading">Загрузка...</div>
      ) : (
        <div className="friend-search-results">
          {/* Отображаем входящие запросы дружбы */}
          {friendRequests.length > 0 && (
            <div className="friend-requests-section">
              <h3>Запросы в друзья</h3>
              <ul className="friend-requests-list">
                {friendRequests.map(request => (
                  <li key={request.id} className="friend-request-item">
                    <div className="friend-request-info">
                      <div className="friend-request-avatar">
                        {request.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="friend-request-details">
                        <div className="friend-request-name">
                          {request.username}
                        </div>
                      </div>
                    </div>
                    <div className="friend-request-actions">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAcceptFriend(request.id)}
                      >
                        Принять
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleRejectFriend(request.id)}
                      >
                        Отклонить
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Отображаем результаты поиска */}
          {filteredUsers.length > 0 ? (
            <ul className="friend-search-list">
              {filteredUsers.map(user => (
                <li
                  key={user.id}
                  className="friend-search-item"
                >
                  <div className="friend-search-item-avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="friend-search-item-info">
                    <div className="friend-search-item-name">
                      {user.username}
                    </div>
                  </div>
                  <Button
                    variant={addedFriends.has(String(user.id)) ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleAddFriend(String(user.id))}
                    disabled={addedFriends.has(String(user.id))}
                  >
                    {addedFriends.has(String(user.id)) ? 'Запрос отправлен' : 'Добавить'}
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="friend-search-empty">
              {searchTerm ? 'Пользователи не найдены' : 'Нет пользователей для отображения'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};