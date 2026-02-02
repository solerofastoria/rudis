import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FriendsList } from '../../components/FriendsList';
import { FriendSearch } from '../../components/FriendSearch';
import './FriendSearchPage.css';

export const FriendSearchPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'friends' | 'add'>('friends');

  const handleBack = () => {
    navigate('/app/chat');
  };

  return (
    <div className="friend-search-page">
      <div className="friend-search-page-header">
        <button className="friend-search-back-button" onClick={handleBack}>
          ← Назад
        </button>
        <h1>Поиск друзей</h1>
      </div>
      
      <div className="friend-search-page-content">
        {/* Вкладки */}
        <div className="friend-search-tabs">
          <button
            className={`friend-search-tab ${activeTab === 'friends' ? 'active' : ''}`}
            onClick={() => setActiveTab('friends')}
          >
            Друзья
          </button>
          <button
            className={`friend-search-tab ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Добавить друга
          </button>
        </div>
        
        {/* Содержимое вкладок */}
        <div className="friend-search-tab-content">
          {activeTab === 'friends' && (
            <FriendsList onFriendRemoved={() => {}} />
          )}
          
          {activeTab === 'add' && (
            <FriendSearch />
          )}
        </div>
      </div>
    </div>
  );
};