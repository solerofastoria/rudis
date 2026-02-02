// backend/src/routes/ai.routes.js
// Версия с CommonJS (require) для вашего проекта

const express = require('express');
const aiService = require('../services/aiService');

const router = express.Router();

/**
 * POST /api/ai/chat
 * Основной эндпоинт для чата с AI
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, fastMode = false, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Поле message обязательно' 
      });
    }

    const response = await aiService.chat(message, fastMode, history);

    res.json({ 
      success: true,
      response,
      model: fastMode ? 'groq-llama' : 'gemini',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/chat:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/analyze-code
 * Анализ кода на баги и улучшения
 */
router.post('/analyze-code', async (req, res) => {
  try {
    const { code, language = 'javascript' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: 'Поле code обязательно' 
      });
    }

    const analysis = await aiService.analyzeCode(code, language);

    res.json({ 
      success: true,
      analysis,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/analyze-code:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/generate-code
 * Генерация кода по описанию
 */
router.post('/generate-code', async (req, res) => {
  try {
    const { description, language = 'javascript' } = req.body;

    if (!description) {
      return res.status(400).json({ 
        error: 'Поле description обязательно' 
      });
    }

    const code = await aiService.generateCode(description, language);

    res.json({ 
      success: true,
      code,
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/generate-code:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/fix-code
 * Исправление кода с ошибками
 */
router.post('/fix-code', async (req, res) => {
  try {
    const { code, error } = req.body;

    if (!code || !error) {
      return res.status(400).json({ 
        error: 'Поля code и error обязательны' 
      });
    }

    const fixedCode = await aiService.fixCode(code, error);

    res.json({ 
      success: true,
      fixedCode,
      originalError: error,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/fix-code:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/explain-code
 * Объяснение кода
 */
router.post('/explain-code', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: 'Поле code обязательно' 
      });
    }

    const explanation = await aiService.explainCode(code);

    res.json({ 
      success: true,
      explanation,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/explain-code:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/improve-text
 * Улучшение текста
 */
router.post('/improve-text', async (req, res) => {
  try {
    const { text, style = 'formal' } = req.body;

    if (!text) {
      return res.status(400).json({ 
        error: 'Поле text обязательно' 
      });
    }

    const improvedText = await aiService.improveText(text, style);

    res.json({ 
      success: true,
      originalText: text,
      improvedText,
      style,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/improve-text:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/ai/generate-tests
 * Генерация тестов для кода
 */
router.post('/generate-tests', async (req, res) => {
  try {
    const { code, framework = 'jest' } = req.body;

    if (!code) {
      return res.status(400).json({ 
        error: 'Поле code обязательно' 
      });
    }

    const tests = await aiService.generateTests(code, framework);

    res.json({ 
      success: true,
      tests,
      framework,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Ошибка /ai/generate-tests:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * GET /api/ai/status
 * Проверка статуса AI сервисов
 */
router.get('/status', (req, res) => {
  try {
    const status = aiService.getStatus();
    
    res.json({ 
      success: true,
      services: status,
      message: status.available 
        ? 'AI сервисы доступны' 
        : 'AI сервисы не настроены. Проверьте API ключи в .env'
    });

  } catch (error) {
    console.error('Ошибка /ai/status:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;