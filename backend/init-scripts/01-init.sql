-- Убедимся что база данных создана
SELECT 'Database discord_clone ready' as status;

-- Создадим тестовую таблицу для проверки
CREATE TABLE IF NOT EXISTS test_connection (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Вставим тестовые данные
INSERT INTO test_connection (message) VALUES ('Database initialized successfully');