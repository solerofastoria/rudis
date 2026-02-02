import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateServerModal } from './CreateServerModal';
import { Button } from './ui/Button/Button';
import './CreateServerModal.css';

interface CreateServerButtonProps {
  onServerCreated?: (serverId: string) => void;
}

export const CreateServerButton = ({ onServerCreated }: CreateServerButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSuccess = (serverId: string) => {
    setIsModalOpen(false);
    // Редирект на новый сервер
    navigate(`/app/servers/${serverId}`);
    // Вызываем callback если передан
    if (onServerCreated) {
      onServerCreated(serverId);
    }
  };

  // Добавляем обработчик события для открытия модального окна из других компонентов
  useEffect(() => {
    const handleOpenModal = () => {
      setIsModalOpen(true);
    };

    window.addEventListener('openCreateServerModal', handleOpenModal);
    
    return () => {
      window.removeEventListener('openCreateServerModal', handleOpenModal);
    };
  }, []);

  return (
    <>
      <Button
        variant="primary"
        onClick={() => {
          console.log("CLICK CREATE SERVER");
          setIsModalOpen(true);
        }}
        aria-label="Создать сервер"
        className="create-button"
      >
        <div className="create-icon">+</div>
      </Button>
      
      <CreateServerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
};