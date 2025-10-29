# BFF (Backend For Frontend) Архитектура

## 📋 Описание

Проект использует паттерн **BFF (Backend For Frontend)** — тонкий слой API между фронтендом и основным бэкендом, реализованный через Next.js API Routes.

## 🎯 Преимущества BFF

1. **Безопасность** — токены хранятся в httpOnly cookies, недоступных для JavaScript
2. **Гибкость** — можно трансформировать данные бэкенда под нужды фронтенда
3. **Кэширование** — можно кэшировать запросы к бэкенду
4. **Упрощение клиента** — клиент не знает о деталях бэкенда
5. **CORS** — нет проблем с CORS, все запросы идут с того же домена

## 📁 Структура

```
src/
├── app/
│   └── api/                    # BFF API Routes
│       └── auth/
│           ├── login/
│           │   └── route.ts    # POST /api/auth/login
│           ├── logout/
│           │   └── route.ts    # POST /api/auth/logout
│           └── me/
│               └── route.ts    # GET /api/auth/me
│
├── shared/
│   ├── api/                    # API клиент и типы
│   │   ├── client.ts           # HTTP клиент для запросов
│   │   ├── types.ts            # TypeScript типы для API
│   │   └── index.ts
│   │
│   └── hooks/
│       ├── use-auth.ts         # Хук для авторизации
│       └── index.ts
```

## 🔐 API Endpoints

### POST /api/auth/login

Авторизация пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success):**
```json
{
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "123",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

**Response (Error):**
```json
{
  "error": {
    "message": "Неверный email или пароль"
  }
}
```

**Cookies:**
- Устанавливает `auth_token` httpOnly cookie с JWT токеном

---

### POST /api/auth/logout

Выход из системы.

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

**Cookies:**
- Удаляет `auth_token` cookie

---

### GET /api/auth/me

Получение данных текущего пользователя.

**Headers:**
- Использует `auth_token` cookie автоматически

**Response (Success):**
```json
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Response (Unauthorized):**
```json
{
  "error": {
    "message": "Не авторизован"
  }
}
```

## 🔧 Использование на клиенте

### Zustand Store (рекомендуется)

```typescript
import { useAuthStore } from "@/shared/store";
import { useRouter } from "next/navigation";

function MyComponent() {
  const router = useRouter();
  const { login, logout, isLoading, user, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();

    try {
      await login({
        email: "user@example.com",
        password: "password123"
      });
      // Успешная авторизация
      router.push("/dashboard");
    } catch (error) {
      // Ошибка уже в store.error
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      {user && <p>Привет, {user.name}!</p>}
      <button onClick={handleLogin} disabled={isLoading}>
        {isLoading ? "Вход..." : "Войти"}
      </button>
    </div>
  );
}
```

### Хук useAuth (deprecated)

```typescript
import { useAuth } from "@/shared/hooks";

// ⚠️ Deprecated: используйте useAuthStore напрямую
function MyComponent() {
  const { login, logout, isLoading } = useAuth();
  // Теперь это просто обертка над useAuthStore
}
```

### Прямые запросы к BFF

```typescript
// Авторизация
const response = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password })
});

const result = await response.json();
```

## ⚙️ Настройка

### Переменные окружения

Создайте файл `.env.local`:

```env
# URL вашего основного бэкенда
BACKEND_API_URL=http://localhost:8000

# Public URL (если нужен на клиенте)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Пример `.env.local.example` уже создан в корне проекта

## 🔄 Поток данных

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Browser   │         │  Next.js    │         │   Backend   │
│   (Client)  │────────▶│     BFF     │────────▶│     API     │
│             │         │  (API Route)│         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                       │                        │
      │  1. POST /api/login   │  2. POST /auth/login   │
      │─────────────────────▶ │───────────────────────▶│
      │                       │                        │
      │                       │  3. JWT Token          │
      │                       │◀───────────────────────│
      │  4. Set httpOnly      │                        │
      │     cookie + response │                        │
      │◀─────────────────────│                        │
```

## 🛡️ Безопасность

1. **httpOnly cookies** — токены недоступны для JavaScript (защита от XSS)
2. **sameSite: lax** — защита от CSRF атак
3. **secure в production** — cookies только через HTTPS
4. **Валидация** — проверка данных перед отправкой на бэкенд
5. **Изоляция** — клиент не знает URL бэкенда

## 🚀 Расширение

### Добавление нового endpoint

1. **Создайте route handler:**

```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  
  const response = await fetch(
    `${process.env.BACKEND_API_URL}/users`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  const data = await response.json();
  return NextResponse.json({ data });
}
```

2. **Добавьте типы:**

```typescript
// src/shared/api/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

3. **Используйте в компоненте:**

```typescript
const response = await fetch("/api/users");
const { data } = await response.json();
```

## 📝 Best Practices

1. ✅ Всегда используйте типизацию (TypeScript types)
2. ✅ Обрабатывайте ошибки (try/catch)
3. ✅ Валидируйте входные данные
4. ✅ Логируйте ошибки на сервере
5. ✅ Используйте переменные окружения для URL
6. ✅ Храните токены в httpOnly cookies
7. ✅ Возвращайте единообразные ответы (data/error)

## 🔗 Связь с FSD архитектурой

- **app/api/** — слой app, BFF endpoints
- **shared/api/** — переиспользуемый код для работы с API
- **shared/hooks/** — React хуки для работы с BFF
- **features/** — компоненты, использующие BFF через хуки

---

**Статус:** ✅ Готово к использованию  
**Последнее обновление:** 29 октября 2025
