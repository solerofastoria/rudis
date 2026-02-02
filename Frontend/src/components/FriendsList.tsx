import { useState, useEffect } from 'react';
import { getFriends } from '../api/friends';
import { removeFriend } from '../api/friends';
import type { Friend } from '../api/friends';
import { Input } from '../components/ui/Input/Input';
import { Button } from '../components/ui/Button/Button';
import './FriendsList.css';

interface FriendsListProps {
  onFriendRemoved?: () => void;
}

export const FriendsList = ({ onFriendRemoved }: FriendsListProps) => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const friendsPerPage = 10;

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const friendsList = await getFriends();
      setFriends(friendsList);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Фильтрация друзей по поисковому запросу
  const filteredFriends = friends.filter(friend =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Пагинация
  const totalPages = Math.ceil(filteredFriends.length / friendsPerPage);
  const startIndex = (currentPage - 1) * friendsPerPage;
  const paginatedFriends = filteredFriends.slice(startIndex, startIndex + friendsPerPage);

  // Сброс страницы при изменении поиска
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleRemoveFriend = async (friendId: string) => {
    try {
      await removeFriend(friendId);
      // Обновляем список друзей
      fetchFriends();
      // Вызываем обновление в родительском компоненте
      if (onFriendRemoved) {
        onFriendRemoved();
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      alert('Ошибка при удалении из друзей');
    }
  };

  if (loading) {
    return <div className="friends-list-loading">Загрузка друзей...</div>;
  }

  return (
    <div className="friends-list">
      <div className="friends-list-header">
        <h2>Ваши друзья</h2>
        <div className="friends-search-container">
          <Input
            type="text"
            placeholder="Поиск друзей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      {paginatedFriends.length > 0 ? (
        <>
          <ul className="friends-list-items">
            {paginatedFriends.map(friend => (
              <li key={friend.id} className="friends-list-item">
                <div className="friends-list-item-info">
                  <div className="friends-list-item-avatar">
                    {friend.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="friends-list-item-details">
                    <div className="friends-list-item-name">
                      {friend.username}
                    </div>
                    <div className={`friends-list-item-status ${friend.online ? 'online' : 'offline'}`}>
                      {friend.online ? 'В сети' : 'Не в сети'}
                    </div>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemoveFriend(friend.id)}
                >
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
          
          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="friends-pagination">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Назад
              </Button>
              
              <span className="friends-pagination-info">
                Страница {currentPage} из {totalPages}
              </span>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Вперед
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="friends-list-empty">
          {searchTerm ? 'Друзья не найдены' : 'У вас пока нет друзей'}
        </div>
      )}
    </div>
  );
};

export default FriendsList;