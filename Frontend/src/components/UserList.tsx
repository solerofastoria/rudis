import { useState, useEffect, useMemo } from 'react';
import { getUsers } from '../api/users';
import type { User } from '../api/users';
import './UserList.css';

interface UserListProps {
  selectedUserId?: string;
  onSelectUser?: (userId: string | null) => void;
}

export const UserList = ({ selectedUserId, onSelectUser }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Мемоизация списка пользователей
  const memoizedUserList = useMemo(() => {
    return users.map(user => (
      <li 
        key={user.id}
        className={selectedUserId === String(user.id) ? 'selected' : ''}
        onClick={() => onSelectUser?.(String(user.id))}
      >
        {user.username}
      </li>
    ));
  }, [users, selectedUserId, onSelectUser]);

  if (loading) {
    return <div className="user-list">Загрузка пользователей...</div>;
  }

  return (
    <div className="user-list">
      <h3>Чаты</h3>
      <ul>
        <li 
          className={!selectedUserId ? 'selected' : ''}
          onClick={() => onSelectUser?.(null)}
        >
          🌐 Общий чат
        </li>
        {memoizedUserList}
      </ul>
    </div>
  );
};

export default UserList;