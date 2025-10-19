# Project Frontend

Современное Next.js приложение с архитектурой **Feature-Sliced Design (FSD)**.

## 🏗️ Архитектура

Проект построен на базе методологии **Feature-Sliced Design** - архитектурного подхода для масштабируемых фронтенд приложений.

```
src/
├── app/          # Pages & routing (Next.js App Router)
├── widgets/      # Composite UI blocks
├── features/     # User interactions & features
├── entities/     # Business entities
└── shared/       # Reusable code (UI, utils, hooks)
```

📖 Подробнее об архитектуре: [ARCHITECTURE.md](./ARCHITECTURE.md)

## 🚀 Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск dev сервера

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) для просмотра.

### Сборка проекта

```bash
npm run build
```

### Запуск production

```bash
npm run start
```

Вы можете начать редактировать страницы в `src/app/page.tsx`. Изменения применяются автоматически.

## 📚 Документация

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Визуальные схемы архитектуры и правила
- [FSD-STRUCTURE.md](./FSD-STRUCTURE.md) - Детальное описание структуры проекта
- [MIGRATION-REPORT.md](./MIGRATION-REPORT.md) - Отчёт о миграции на FSD

## 🛠️ Стек технологий

- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - Статическая типизация
- **Tailwind CSS** - Utility-first CSS фреймворк
- **Radix UI** - Headless UI компоненты
- **shadcn/ui** - Коллекция переиспользуемых компонентов
- **Feature-Sliced Design** - Архитектурная методология

## 📁 Структура импортов

```typescript
// Shared layer (доступен везде)
import { Button, Input, Dialog } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { useIsMobile } from "@/shared/hooks";

// Features (функциональность)
import { ChatMessage } from "@/features/chat-message";
import { UserDropdown } from "@/features/user-dropdown";

// Widgets (композитные блоки)
import { Chat } from "@/widgets/chat";
import { AppSidebar } from "@/widgets/app-sidebar";
```

## 🎯 Основные концепции FSD

### Слои (Layers)

Каждый слой имеет свою зону ответственности:

- **app** - инициализация, роутинг, провайдеры
- **widgets** - большие композитные блоки
- **features** - конкретные пользовательские действия
- **entities** - бизнес-сущности
- **shared** - переиспользуемый код

### Правила

1. Верхние слои могут импортировать только из нижних
2. Слои одного уровня не могут импортировать друг друга
3. Каждый модуль имеет Public API через `index.ts`

## 🔄 Добавление нового функционала

### Новая feature

```bash
mkdir -p src/features/my-feature/ui
touch src/features/my-feature/ui/my-feature.tsx
touch src/features/my-feature/index.ts
```

### Новый widget

```bash
mkdir -p src/widgets/my-widget/ui
touch src/widgets/my-widget/ui/my-widget.tsx
touch src/widgets/my-widget/index.ts
```

## 🎨 UI компоненты

Все базовые UI компоненты находятся в `src/shared/ui` и построены на базе:

- **Radix UI** - доступные headless компоненты
- **Tailwind CSS** - кастомизируемые стили
- **shadcn/ui** - готовые паттерны

## 📦 Скрипты

```bash
npm run dev        # Запуск development сервера с Turbopack
npm run build      # Production сборка
npm run start      # Запуск production сервера
npm run lint       # ESLint проверка
```

## 🔗 Полезные ссылки

- [Next.js Documentation](https://nextjs.org/docs)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)

## 📄 Лицензия

Этот проект создан с использованием [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
