import { useState, useRef, useEffect } from 'react';
import { createServer } from '../api/servers';
import type { ServerCreateData } from '../features/servers/types';
import { Input } from './ui/Input/Input';
import { Button } from './ui/Button/Button';

interface CreateServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (serverId: string) => void;
}

export const CreateServerModal = ({ isOpen, onClose, onSuccess }: CreateServerModalProps) => {
  console.log("MODAL RENDER", isOpen);
  const [formData, setFormData] = useState<Omit<ServerCreateData, 'icon'> & { icon?: File }>({
    name: '',
    region: 'eu-west',
    privacy: 'public',
    template: 'default'
  });
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Сброс состояния при открытии модалки
      setFormData({
        name: '',
        region: 'eu-west',
        privacy: 'public',
        template: 'default'
      });
      setIconPreview(null);
      setError(null);
      setCharCount(0);
    }
  }, [isOpen]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData({ ...formData, name });
    setCharCount(name.length);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверка размера файла (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Размер иконки не должен превышать 5MB');
        return;
      }
      
      // Проверка типа файла
      if (!file.type.match('image.*')) {
        setError('Пожалуйста, выберите изображение');
        return;
      }
      
      setFormData({ ...formData, icon: file });
      setError(null);
      
      // Создание превью
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const removeIcon = () => {
    setIconPreview(null);
    setFormData({ ...formData, icon: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!formData.name || formData.name.trim().length < 2) {
      errors.push('Название должно содержать минимум 2 символа');
    }
    
    if (formData.name.length > 100) {
      errors.push('Название не должно превышать 100 символов');
    }
    
    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const serverData: ServerCreateData = {
        name: formData.name.trim(),
        region: formData.region,
        privacy: formData.privacy,
        template: formData.template,
        icon: formData.icon
      };
      
      const response = await createServer(serverData);
      
      if (response.success && response.server) {
        onSuccess(response.server.id);
      } else {
        setError(response.error?.message || 'Ошибка при создании сервера');
      }
    } catch (err) {
      setError('Произошла ошибка при создании сервера');
      console.error('Server creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="modal-title">Создать свой сервер</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Закрыть">
            ✕
          </Button>
        </div>
        
        <p className="modal-description">
          Дайте вашему серверу индивидуальность с названием и иконкой
        </p>
        
        <form onSubmit={handleSubmit} className="create-server-form">
          <div className="form-group">
            <label htmlFor="server-name" className="form-label">
              НАЗВАНИЕ СЕРВЕРА
            </label>
            <Input
              id="server-name"
              type="text"
              value={formData.name}
              onChange={handleNameChange}
              placeholder="Введите название сервера"
              maxLength={100}
              disabled={isSubmitting}
              required
            />
            <div className="char-counter">
              {charCount}/100
            </div>
            {charCount > 90 && (
              <div className="char-warning">
                {100 - charCount} символов осталось
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">ИКОНКА СЕРВЕРА</label>
            <div className="icon-upload-container">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/gif"
                className="file-input"
                disabled={isSubmitting}
              />
              
              <div 
                className="icon-preview"
                onClick={handleIconClick}
              >
                {iconPreview ? (
                  <img src={iconPreview} alt="Предпросмотр иконки" className="icon-preview-image" />
                ) : (
                  <div className="icon-placeholder">
                    <div className="upload-icon">📷</div>
                    <span>Загрузить иконку</span>
                  </div>
                )}
              </div>
              
              {iconPreview && (
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={removeIcon}
                  disabled={isSubmitting}
                >
                  Удалить иконку
                </Button>
              )}
            </div>
          </div>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="modal-actions">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Назад
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Создать
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};