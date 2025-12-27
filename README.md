# CJM Platform — Frontend

Веб-приложение для автоматизированного анализа бизнес-требований с использованием AI-агента.

## 🚀 Быстрый старт

```bash
# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Production сборка
npm run build

# Запуск production сервера
npm run start
```

Откройте [http://localhost:3000](http://localhost:3000) для просмотра.

## 🛠️ Технологический стек

| Категория | Технологии |
|-----------|------------|
| **Фреймворк** | Next.js 15, TypeScript |
| **Стилизация** | Tailwind CSS 4, Radix UI, shadcn/ui |
| **State** | Zustand, TanStack Query |
| **Формы** | react-hook-form + zod |
| **Тестирование** | Vitest, Testing Library |
| **CI/CD** | GitHub Actions, Docker |

## 🏗️ Архитектура

Проект построен на методологии **Feature-Sliced Design (FSD)**:

```
src/
├── app/          # Страницы и роутинг (Next.js App Router)
├── widgets/      # Композитные UI-блоки
├── features/     # Пользовательские действия
├── entities/     # Бизнес-сущности
└── shared/       # Переиспользуемый код (UI, hooks, lib, store)
```

## 📦 Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Development сервер с Turbopack |
| `npm run build` | Production сборка |
| `npm run start` | Запуск production сервера |
| `npm run lint` | ESLint проверка |
| `npm run test` | Запуск тестов |

## 🐳 Docker

### Готовый образ из GHCR

CI/CD пайплайн автоматически собирает и публикует образ в GitHub Container Registry:

```bash
# Pull образа
docker pull ghcr.io/oglenyaboss/project-frontend:latest

# Запуск контейнера
docker run -p 3000:3000 ghcr.io/oglenyaboss/project-frontend:latest
```

### Локальная сборка

```bash
# Сборка образа
docker build -t cjm-frontend \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_WS_URL=wss://api.example.com/ws .

# Запуск контейнера
docker run -p 3000:3000 cjm-frontend
```

## 📚 Документация

Подробная документация находится в директории [`docs/`](./docs/):

- [**PROJECT-DOCUMENTATION.md**](./docs/PROJECT-DOCUMENTATION.md) — Полная техническая документация
- [**API-INTEGRATION.md**](./docs/API-INTEGRATION.md) — Интеграция с бэкендом

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_WS_URL=wss://api.example.com/ws
```

Пример конфигурации: [`.env.example`](./.env.example)
