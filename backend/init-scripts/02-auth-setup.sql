-- Устанавливаем метод аутентификации md5 для всех подключений
ALTER SYSTEM SET password_encryption = 'md5';
SELECT pg_reload_conf();

-- Сбрасываем пароль для использования md5
ALTER USER postgres WITH PASSWORD 'password';