# Project Frontend - FSD Architecture

Проект мигрирован на архитектуру **Feature-Sliced Design (FSD)** для Next.js 15 с App Router.

## 📁 Структура проекта

```
src/
├── app/                    # Next.js App Router страницы
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница
│   ├── globals.css        # Глобальные стили
│   └── dashboard/         # Страница дашборда
│       └── page.tsx
│
├── widgets/               # Композитные блоки (виджеты)
│   ├── app-sidebar/       # Боковая панель приложения
│   │   ├── ui/
│   │   │   └── app-sidebar.tsx
│   │   └── index.ts
│   ├── chat/              # Виджет чата
│   │   ├── ui/
│   │   │   └── chat.tsx
│   │   └── index.ts
│   └── settings-panel/    # Панель настроек
│       ├── ui/
│       │   └── settings-panel.tsx
│       └── index.ts
│
├── features/              # Функциональные возможности
│   ├── chat-message/      # Отображение сообщения чата
│   │   ├── ui/
│   │   │   └── chat-message.tsx
│   │   └── index.ts
│   ├── slider-control/    # Контрол слайдера
│   │   ├── ui/
│   │   │   └── slider-control.tsx
│   │   └── index.ts
│   ├── team-switcher/     # Переключатель команд
│   │   ├── ui/
│   │   │   └── team-switcher.tsx
│   │   └── index.ts
│   └── user-dropdown/     # Выпадающее меню пользователя
│       ├── ui/
│       │   └── user-dropdown.tsx
│       └── index.ts
│
├── entities/              # Бизнес-сущности (пусто - для будущего)
│
└── shared/                # Переиспользуемый код
    ├── ui/                # UI компоненты (shadcn/ui)
    │   ├── alert-dialog.tsx
    │   ├── avatar.tsx
    │   ├── button.tsx
    │   ├── dialog.tsx
    │   ├── dropdown-menu.tsx
    │   ├── input.tsx
    │   ├── label.tsx
    │   ├── select.tsx
    │   ├── sidebar.tsx
    │   ├── slider.tsx
    │   └── ... (другие UI компоненты)
    │   └── index.ts       # Public API
    ├── lib/               # Утилиты
    │   ├── utils.ts
    │   └── index.ts
    ├── hooks/             # React хуки
    │   ├── use-mobile.ts
    │   ├── use-slider-with-input.ts
    │   └── index.ts
    └── config/            # Конфигурация (для будущего)
```

## 🎯 Принципы FSD

### Слои (Layers)

1. **app/** - Инициализация приложения, роутинг, провайдеры
2. **widgets/** - Композитные блоки страниц (собраны из features и entities)
3. **features/** - Части функциональности приложения (действия пользователя)
4. **entities/** - Бизнес-сущности (модели данных)
5. **shared/** - Переиспользуемый код без привязки к бизнес-логике

### Правила импорта

- Слой может импортировать только из нижележащих слоёв
- `app` → `widgets` → `features` → `entities` → `shared`
- Слои не могут импортировать из параллельных слоёв
- Каждый модуль имеет Public API через `index.ts`

## 🚀 Использование

### Импорт компонентов

```typescript
// Из shared слоя
import { Button, Input, Label } from "@/shared/ui";
import { cn } from "@/shared/lib";
import { useIsMobile } from "@/shared/hooks";

// Из features
import { ChatMessage } from "@/features/chat-message";
import { TeamSwitcher } from "@/features/team-switcher";
import { UserDropdown } from "@/features/user-dropdown";

// Из widgets
import { Chat } from "@/widgets/chat";
import { AppSidebar } from "@/widgets/app-sidebar";
import { SettingsPanel } from "@/widgets/settings-panel";
```

## 📝 Добавление новых модулей

### Добавление нового feature

```bash
mkdir -p src/features/my-feature/ui
touch src/features/my-feature/ui/my-feature.tsx
touch src/features/my-feature/index.ts
```

```typescript
// src/features/my-feature/index.ts
export { MyFeature } from "./ui/my-feature";
```

### Добавление нового widget

```bash
mkdir -p src/widgets/my-widget/ui
touch src/widgets/my-widget/ui/my-widget.tsx
touch src/widgets/my-widget/index.ts
```

```typescript
// src/widgets/my-widget/index.ts
export { MyWidget } from "./ui/my-widget";
```

## 🔧 Конфигурация

### tsconfig.json

Пути настроены для работы с новой структурой:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## 📚 Ресурсы

- [Feature-Sliced Design документация](https://feature-sliced.design/)
- [Next.js 15 документация](https://nextjs.org/docs)
- [shadcn/ui компоненты](https://ui.shadcn.com/)

## 🎨 Стек технологий

- **Next.js 15** - React фреймворк с App Router
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Radix UI** - Headless UI компоненты
- **shadcn/ui** - UI библиотека
- **FSD** - Архитектурная методология

## ⚡ Команды

```bash
# Разработка
npm run dev

# Сборка
npm run build

# Запуск production
npm run start

# Линтинг
npm run lint
```
