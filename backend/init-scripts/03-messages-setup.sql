-- Создаем таблицу сообщений с правильной структурой
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    "isDirect" BOOLEAN DEFAULT false,
    "recipientId" UUID REFERENCES users(id) ON DELETE SET NULL,
    "senderId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "isEdited" BOOLEAN DEFAULT false,
    "editedAt" TIMESTAMP WITH TIME ZONE,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Создаем индексы для улучшения производительности
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages("senderId");
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages("recipientId");
CREATE INDEX IF NOT EXISTS idx_messages_direct ON messages("isDirect");
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages("createdAt");