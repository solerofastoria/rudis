import { useState, useEffect } from 'react';

interface PerformanceStats {
  messageCount: number;
  renderTime: number;
  updatesPerSecond: number;
  averageRenderTime: number;
}

export const ChatPerformanceStats = () => {
  const [stats, setStats] = useState<PerformanceStats>({
    messageCount: 0,
    renderTime: 0,
    updatesPerSecond: 0,
    averageRenderTime: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);

  // Симуляция обновления статистики
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      // Генерируем случайные данные для демонстрации
      const newStats: PerformanceStats = {
        messageCount: Math.floor(Math.random() * 1000),
        renderTime: Math.random() * 100,
        updatesPerSecond: Math.random() * 50,
        averageRenderTime: Math.random() * 50
      };
      
      setStats(newStats);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '10px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        Показать статистику производительности
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '15px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '12px',
      zIndex: 1000,
      maxWidth: '300px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '14px' }}>Производительность чата</h3>
        <button 
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>Сообщений</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{stats.messageCount}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>Время рендера</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{stats.renderTime.toFixed(2)} мс</div>
        </div>
        
        <div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>Обновлений/с</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{stats.updatesPerSecond.toFixed(1)}</div>
        </div>
        
        <div>
          <div style={{ fontSize: '10px', opacity: 0.7 }}>Среднее время</div>
          <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{stats.averageRenderTime.toFixed(2)} мс</div>
        </div>
      </div>
      
      <div style={{ 
        marginTop: '10px', 
        padding: '8px', 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '4px',
        fontSize: '10px'
      }}>
        <div>Оптимизация: троттлинг 100мс, мемоизация компонентов</div>
      </div>
    </div>
  );
};