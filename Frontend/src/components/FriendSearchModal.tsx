import { useState, useEffect } from 'react';
import { getUsers } from '../api/users';
import { addFriend, getFriends } from '../api/friends';
import type { User } from '../api/users';
import type { Friend } from '../api/friends';
import { Input } from '../components/ui/Input/Input';
import { Button } from '../components/ui/Button/Button';
import './FriendSearchModal.css';

interface FriendSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (userId: string) => void;
  onFriendsUpdate?: () => void;
}

export const FriendSearchModal = ({ isOpen, onClose, onSelectUser, onFriendsUpdate }: FriendSearchModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedFriends, setAddedFriends] = useState<Set<string>>(new Set());
  const [friends, setFriends] = useState<Friend[]>([]);

  // Загрузка пользователей и друзей при открытии модального окна
  useEffect(() => {
    if (isOpen) {
      fetchUsersAndFriends();
    }
  }, [isOpen]);

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

  const fetchUsersAndFriends = async () => {
    setLoading(true);
    try {
      // Загружаем всех пользователей
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      
      // Загружаем список друзей
      try {
        const friendsList = await getFriends();
        setFriends(friendsList);
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };
  
  
  // Вызываем обновление списка друзей
  useEffect(() => {
    if (onFriendsUpdate) {
      onFriendsUpdate();
    }
  }, [friends, onFriendsUpdate]);

  const handleAddFriend = async (userId: string) => {
    // Проверяем, является ли пользователь уже другом
    const isAlreadyFriend = friends.some(friend => friend.id === userId);
    if (isAlreadyFriend) {
      alert('Этот пользователь уже у вас в друзьях!');
      return;
    }
    
    try {
      await addFriend(userId);
      // Добавляем пользователя в список добавленных друзей
      setAddedFriends(prev => new Set(prev).add(userId));
      
      // Вызываем обновление списка друзей, если передана функция
      if (onFriendsUpdate) {
        onFriendsUpdate();
      }
      
      // Обновляем список пользователей и друзей
      fetchUsersAndFriends();
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

  const handleUserSelect = (userId: string) => {
    onSelectUser(userId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="friend-search-modal-overlay" onClick={onClose}>
      <div className="friend-search-modal" onClick={e => e.stopPropagation()}>
        <div className="friend-search-modal-header">
          <h2>Поиск друзей</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>
        
        <div className="friend-search-modal-content">
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
              {filteredUsers.length > 0 ? (
                <ul className="friend-search-list">
                  {filteredUsers.map(user => (
                    <li
                      key={user.id}
                      className="friend-search-item"
                    >
                      <div
                        className="friend-search-item-avatar"
                        onClick={() => handleUserSelect(String(user.id))}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="friend-search-item-info">
                        <div
                          className="friend-search-item-name"
                          onClick={() => handleUserSelect(String(user.id))}
                        >
                          {user.username}
                        </div>
                      </div>
                      <Button
                        variant={friends.some(f => f.id === String(user.id)) ? 'secondary' : 'primary'}
                        size="sm"
                        onClick={() => handleAddFriend(String(user.id))}
                        disabled={addedFriends.has(String(user.id)) || friends.some(f => f.id === String(user.id))}
                      >
                        {friends.some(f => f.id === String(user.id)) ? 'В друзьях' :
                         addedFriends.has(String(user.id)) ? 'Добавлен' : 'Добавить'}
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
      </div>
    </div>
  );
};