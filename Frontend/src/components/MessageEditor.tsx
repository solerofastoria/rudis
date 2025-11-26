import { useState, useEffect, useRef } from 'react';
import './MessageEditor.css';

interface MessageEditorProps {
  initialValue?: string;
  onSave: (content: string) => void;
  onCancel: () => void;
  placeholder?: string;
}

export const MessageEditor = ({
  initialValue = '',
  onSave,
  onCancel,
  placeholder = 'Введите сообщение...'
}: MessageEditorProps) => {
  const [content, setContent] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Фокус на textarea при монтировании
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Помещаем курсор в конец текста
      textareaRef.current.selectionStart = content.length;
      textareaRef.current.selectionEnd = content.length;
    }
  }, []);

  const handleSubmit = () => {
    if (content.trim()) {
      onSave(content.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="message-editor">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="message-editor-textarea"
        rows={3}
      />
      <div className="message-editor-actions">
        <button 
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="save-button"
        >
          Сохранить
        </button>
        <button 
          onClick={onCancel}
          className="cancel-button"
        >
          Отмена
        </button>
      </div>
    </div>
  );
};