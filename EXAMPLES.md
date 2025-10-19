# Примеры использования FSD архитектуры

## 📋 Оглавление

1. [Создание нового feature](#создание-нового-feature)
2. [Создание нового widget](#создание-нового-widget)
3. [Добавление entity](#добавление-entity)
4. [Работа с shared слоем](#работа-с-shared-слоем)
5. [Интеграция в страницы](#интеграция-в-страницы)

---

## Создание нового feature

### Пример: Feature для отправки сообщения

**Шаг 1:** Создайте структуру директорий

```bash
mkdir -p src/features/send-message/ui
mkdir -p src/features/send-message/model
```

**Шаг 2:** Создайте UI компонент

```typescript
// src/features/send-message/ui/send-message-form.tsx
"use client";

import { useState } from "react";
import { Button, Input } from "@/shared/ui";

interface SendMessageFormProps {
  onSend: (message: string) => void;
}

export function SendMessageForm({ onSend }: SendMessageFormProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <Button type="submit">Send</Button>
    </form>
  );
}
```

**Шаг 3:** Создайте типы (если нужно)

```typescript
// src/features/send-message/model/types.ts
export interface Message {
  id: string;
  text: string;
  timestamp: Date;
  userId: string;
}
```

**Шаг 4:** Создайте Public API

```typescript
// src/features/send-message/index.ts
export { SendMessageForm } from "./ui/send-message-form";
export type { Message } from "./model/types";
```

**Использование:**

```typescript
import { SendMessageForm } from "@/features/send-message";

function ChatWidget() {
  const handleSend = (message: string) => {
    console.log("Sending:", message);
  };

  return <SendMessageForm onSend={handleSend} />;
}
```

---

## Создание нового widget

### Пример: Widget для уведомлений

**Шаг 1:** Создайте структуру

```bash
mkdir -p src/widgets/notifications/ui
mkdir -p src/widgets/notifications/model
```

**Шаг 2:** Создайте компонент

```typescript
// src/widgets/notifications/ui/notifications-panel.tsx
"use client";

import { useState } from "react";
import { Button, Badge } from "@/shared/ui";
import { RiBellLine } from "@remixicon/react";

export function NotificationsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [count, setCount] = useState(3);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
        <RiBellLine size={20} />
        {count > 0 && (
          <Badge className="absolute -top-1 -right-1">{count}</Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg p-4">
          <h3 className="font-medium mb-2">Notifications</h3>
          <div className="space-y-2">
            <div className="p-2 hover:bg-gray-50 rounded">
              New message from John
            </div>
            <div className="p-2 hover:bg-gray-50 rounded">Task completed</div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Шаг 3:** Public API

```typescript
// src/widgets/notifications/index.ts
export { NotificationsPanel } from "./ui/notifications-panel";
```

**Использование:**

```typescript
import { NotificationsPanel } from "@/widgets/notifications";

function Header() {
  return (
    <header>
      <NotificationsPanel />
    </header>
  );
}
```

---

## Добавление entity

### Пример: Entity для пользователя

**Шаг 1:** Создайте структуру

```bash
mkdir -p src/entities/user/model
mkdir -p src/entities/user/ui
mkdir -p src/entities/user/api
```

**Шаг 2:** Создайте типы

```typescript
// src/entities/user/model/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin" | "moderator";
}

export interface UserProfile extends User {
  bio?: string;
  location?: string;
  joinedAt: Date;
}
```

**Шаг 3:** Создайте хуки

```typescript
// src/entities/user/model/hooks.ts
"use client";

import { useState, useEffect } from "react";
import { User } from "./types";

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user data
    const fetchUser = async () => {
      try {
        // API call here
        const data = await fetch("/api/user/me").then((r) => r.json());
        setUser(data);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return { user, loading };
}
```

**Шаг 4:** Создайте UI компонент (если нужно)

```typescript
// src/entities/user/ui/user-card.tsx
import { User } from "../model/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui";

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.name[0]}</AvatarFallback>
      </Avatar>
      <div>
        <div className="font-medium">{user.name}</div>
        <div className="text-sm text-muted-foreground">{user.email}</div>
      </div>
    </div>
  );
}
```

**Шаг 5:** Public API

```typescript
// src/entities/user/index.ts
export { UserCard } from "./ui/user-card";
export { useCurrentUser } from "./model/hooks";
export type { User, UserProfile } from "./model/types";
```

---

## Работа с shared слоем

### Добавление новой утилиты

```typescript
// src/shared/lib/format.ts
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
```

```typescript
// src/shared/lib/index.ts
export * from "./utils";
export * from "./format"; // Добавляем новый экспорт
```

### Добавление нового хука

```typescript
// src/shared/hooks/use-debounce.ts
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

```typescript
// src/shared/hooks/index.ts
export { useIsMobile } from "./use-mobile";
export { useSliderWithInput } from "./use-slider-with-input";
export { useDebounce } from "./use-debounce"; // Добавляем
```

### Добавление нового UI компонента

Используйте shadcn/ui CLI:

```bash
npx shadcn@latest add badge
```

Компонент автоматически добавится в `src/shared/ui/`.

Или создайте вручную:

```typescript
// src/shared/ui/custom-component.tsx
export function CustomComponent() {
  return <div>Custom Component</div>;
}
```

И экспортируйте:

```typescript
// src/shared/ui/index.ts
export * from "./custom-component";
```

---

## Интеграция в страницы

### Пример: Страница профиля

```typescript
// src/app/profile/page.tsx
import { UserCard, useCurrentUser } from "@/entities/user";
import { NotificationsPanel } from "@/widgets/notifications";

export default function ProfilePage() {
  const { user, loading } = useCurrentUser();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <NotificationsPanel />
      </div>

      <UserCard user={user} />
    </div>
  );
}
```

### Пример: Layout с sidebar

```typescript
// src/app/dashboard/layout.tsx
import { AppSidebar } from "@/widgets/app-sidebar";
import { SidebarProvider, SidebarInset } from "@/shared/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

---

## Лучшие практики

### 1. Именование файлов

```
✅ kebab-case для файлов: user-dropdown.tsx
✅ PascalCase для компонентов: UserDropdown
✅ camelCase для функций: useCurrentUser
```

### 2. Организация импортов

```typescript
// 1. React и внешние библиотеки
import { useState } from "react";
import { format } from "date-fns";

// 2. Entities
import { User } from "@/entities/user";

// 3. Features
import { ChatMessage } from "@/features/chat-message";

// 4. Shared
import { Button, Input } from "@/shared/ui";
import { cn } from "@/shared/lib";
```

### 3. Public API

Всегда экспортируйте только то, что должно быть доступно снаружи:

```typescript
// ❌ Плохо - экспортируем всё
export * from "./ui";
export * from "./model";

// ✅ Хорошо - явные экспорты
export { UserCard } from "./ui/user-card";
export { useCurrentUser } from "./model/hooks";
export type { User } from "./model/types";
```

### 4. Не нарушайте зависимости

```typescript
// ❌ Features не могут импортировать другие features
import { ChatMessage } from "@/features/chat-message"; // в другой feature

// ✅ Используйте entities или shared
import { Message } from "@/entities/message";
```

---

## Миграция существующих компонентов

### Шаг 1: Определите тип компонента

- **Большой композитный блок?** → widget
- **Пользовательское действие?** → feature
- **Бизнес-сущность?** → entity
- **Переиспользуемый UI?** → shared/ui

### Шаг 2: Переместите файл

```bash
# Было
components/chat-widget.tsx

# Стало
src/widgets/chat/ui/chat.tsx
```

### Шаг 3: Обновите импорты

```typescript
// Было
import { Button } from "@/components/ui/button";

// Стало
import { Button } from "@/shared/ui";
```

### Шаг 4: Создайте Public API

```typescript
// src/widgets/chat/index.ts
export { Chat } from "./ui/chat";
```

---

## Полезные команды

```bash
# Создать новый feature
mkdir -p src/features/my-feature/ui && \
touch src/features/my-feature/ui/my-feature.tsx && \
touch src/features/my-feature/index.ts

# Создать новый widget
mkdir -p src/widgets/my-widget/ui && \
touch src/widgets/my-widget/ui/my-widget.tsx && \
touch src/widgets/my-widget/index.ts

# Создать новую entity
mkdir -p src/entities/my-entity/{model,ui,api} && \
touch src/entities/my-entity/model/types.ts && \
touch src/entities/my-entity/index.ts
```
