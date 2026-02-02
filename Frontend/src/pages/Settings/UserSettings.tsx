import { useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { updateProfile } from '../../api/auth';
import './UserSettings.css';

export const UserSettings = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [status, setStatus] = useState(user?.status || 'online');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState(user?.avatar || '');

  const handleSave = async () => {
    try {
      if (user) {
        const response = await updateProfile({
          username,
          email,
          status,
          avatar
        });
        
        if (response.data.success) {
          setUser(response.data.data.user);
          setIsEditing(false);
          alert('Профиль успешно обновлен');
        } else {
          alert(response.data.message || 'Ошибка при обновлении профиля');
        }
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert('Ошибка при обновлении профиля');
    }
  };

  const handleCancel = () => {
    setUsername(user?.username || '');
    setEmail(user?.email || '');
    setStatus(user?.status || 'online');
    setAvatar(user?.avatar || '');
    setIsEditing(false);
  };

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="user-settings">
      <div className="settings-header">
        <h2>Настройки пользователя</h2>
      </div>
      
      <div className="settings-content">
        {/* Аватар и основная информация */}
        <div className="profile-section">
          <div className="avatar-section">
            <div className="avatar-preview">
              {avatar ? (
                <img src={avatar} alt="Avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <button className="change-avatar-btn">
              Изменить аватар
            </button>
          </div>
          
          <div className="profile-info">
            <div className="info-field">
              <label>Имя пользователя</label>
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <div className="info-value">{username}</div>
              )}
            </div>
            
            <div className="info-field">
              <label>Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <div className="info-value">{email}</div>
              )}
            </div>
            
            <div className="info-field">
              <label>Статус</label>
              {isEditing ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="edit-select"
                >
                  <option value="online">В сети</option>
                  <option value="idle">Не активен</option>
                  <option value="dnd">Не беспокоить</option>
                  <option value="offline">Не в сети</option>
                </select>
              ) : (
                <div className="info-value">
                  {status === 'online' && 'В сети'}
                  {status === 'idle' && 'Не активен'}
                  {status === 'dnd' && 'Не беспокоить'}
                  {status === 'offline' && 'Не в сети'}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="actions-section">
          {isEditing ? (
            <div className="edit-actions">
              <button className="save-btn" onClick={handleSave}>
                Сохранить
              </button>
              <button className="cancel-btn" onClick={handleCancel}>
                Отмена
              </button>
            </div>
          ) : (
            <button className="edit-btn" onClick={() => setIsEditing(true)}>
              Редактировать профиль
            </button>
          )}
        </div>
      </div>
    </div>
  );
};