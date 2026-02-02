import { createContext, useContext, useState, type ReactNode } from 'react';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

// Типы для локализации
type LocaleKey = 'ru' | 'en';
type TranslationKeys = typeof ru;

interface LanguageContextType {
  locale: LocaleKey;
  translations: TranslationKeys;
  setLocale: (locale: LocaleKey) => void;
  t: (key: keyof TranslationKeys, subKey: string) => string;
}

// Создаем контекст
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Провайдер языка
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState<LocaleKey>('ru');
  
  // Выбираем переводы в зависимости от языка
  const translations = locale === 'ru' ? ru : en;
  
  // Функция для получения перевода
  const t = (key: keyof TranslationKeys, subKey: string) => {
    const section = translations[key];
    return section ? (section as any)[subKey] || `${key}.${subKey}` : `${key}.${subKey}`;
  };
  
  return (
    <LanguageContext.Provider value={{ locale, translations, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Хук для использования контекста
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};