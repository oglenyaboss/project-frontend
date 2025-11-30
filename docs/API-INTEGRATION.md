# API Integration Plan

> Документация по интеграции с бэкендом через TanStack Query

**Дата создания:** 30 ноября 2025  
**Статус:** В разработке

---

## 📋 Содержание

1. [Обзор архитектуры](#обзор-архитектуры)
2. [Принятые решения](#принятые-решения)
3. [Структура файлов](#структура-файлов)
4. [API Endpoints](#api-endpoints)
5. [Query Keys Strategy](#query-keys-strategy)
6. [Кеширование](#кеширование)
7. [BFF Routes](#bff-routes)
8. [WebSocket интеграция](#websocket-интеграция)
9. [Фазы реализации](#фазы-реализации)

---

## 🏗️ Обзор архитектуры

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐ │
│  │   Entities  │    │  Features   │    │      Widgets        │ │
│  │  (TanStack  │───▶│  (Forms,    │───▶│   (Composed UI)     │ │
│  │   Query)    │    │   Actions)  │    │                     │ │
│  └─────────────┘    └─────────────┘    └─────────────────────┘ │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              shared/api (Axios + Interceptors)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              BFF (Next.js API Routes)                    │   │
│  │  - /api/auth/* (httpOnly cookies)                        │   │
│  │  - /api/projects/*                                       │   │
│  │  - /api/interviews/*                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (FastAPI)                         │
│                  (HTTPBearer Authentication)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Принятые решения

| Вопрос | Решение | Обоснование |
|--------|---------|-------------|
| **Хранение токенов** | httpOnly cookies через BFF | Безопасность от XSS атак |
| **BFF** | Да, Next.js API Routes | Скрытие токенов от клиента |
| **Optimistic Updates** | Да (для CRUD операций) | Лучший UX без изменений бэка |
| **Пагинация** | Классическая (offset/limit) | Соответствует API |
| **Polling/Realtime** | WebSocket | Для статусов интервью |
| **Типизация** | Zod схемы (ручные) | Контроль + валидация |

---

## 📁 Структура файлов

```
src/
├── app/
│   ├── api/                          # BFF Routes
│   │   ├── auth/
│   │   │   ├── login/route.ts        # POST /api/auth/login
│   │   │   ├── register/route.ts     # POST /api/auth/register
│   │   │   ├── logout/route.ts       # POST /api/auth/logout
│   │   │   ├── refresh/route.ts      # POST /api/auth/refresh
│   │   │   └── me/route.ts           # GET /api/auth/me
│   │   ├── user/
│   │   │   └── me/route.ts           # GET, PATCH /api/user/me
│   │   ├── projects/
│   │   │   ├── route.ts              # GET, POST /api/projects
│   │   │   └── [id]/route.ts         # GET, PATCH, DELETE /api/projects/:id
│   │   └── interviews/
│   │       ├── projects/
│   │       │   └── [projectId]/
│   │       │       ├── route.ts      # GET /api/interviews/projects/:projectId
│   │       │       └── upload/route.ts # POST upload
│   │       └── [id]/route.ts         # GET, PATCH, DELETE /api/interviews/:id
│   └── providers.tsx                 # QueryClientProvider
│
├── shared/
│   ├── api/
│   │   ├── client.ts                 # Axios instance + interceptors
│   │   ├── query-client.ts           # TanStack Query config
│   │   ├── query-keys.ts             # Centralized query keys
│   │   ├── types.ts                  # Common API types
│   │   └── index.ts
│   └── lib/
│       └── schemas/                  # Zod schemas
│           ├── auth.ts
│           ├── user.ts
│           ├── project.ts
│           ├── interview.ts
│           └── index.ts
│
├── entities/
│   ├── user/
│   │   ├── api/
│   │   │   └── user-api.ts           # API functions
│   │   ├── model/
│   │   │   ├── types.ts              # User types
│   │   │   └── queries.ts            # useCurrentUser, useUpdateUser
│   │   └── index.ts
│   │
│   ├── project/
│   │   ├── api/
│   │   │   └── project-api.ts
│   │   ├── model/
│   │   │   ├── types.ts
│   │   │   └── queries.ts            # useProjects, useProject, mutations
│   │   ├── ui/                       # Project card, list item
│   │   └── index.ts
│   │
│   └── interview/
│       ├── api/
│       │   └── interview-api.ts
│       ├── model/
│       │   ├── types.ts
│       │   └── queries.ts            # useInterviews, useInterview, mutations
│       ├── ui/                       # Interview card, status badge
│       └── index.ts
│
└── features/
    └── auth/
        ├── api/
        │   └── auth-api.ts           # login, register, logout functions
        ├── model/
        │   └── mutations.ts          # useLogin, useRegister, useLogout
        ├── ui/
        │   ├── login-form.tsx
        │   └── register-form.tsx
        └── index.ts
```

---

## 🔌 API Endpoints

### Auth (features/auth)

| Метод | Backend | BFF Route | Хук | Тип |
|-------|---------|-----------|-----|-----|
| POST | `/auth/register` | `/api/auth/register` | `useRegister` | Mutation |
| POST | `/auth/login` | `/api/auth/login` | `useLogin` | Mutation |
| POST | `/auth/logout` | `/api/auth/logout` | `useLogout` | Mutation |
| POST | `/auth/refresh` | `/api/auth/refresh` | (internal) | Mutation |

### User (entities/user)

| Метод | Backend | BFF Route | Хук | Тип |
|-------|---------|-----------|-----|-----|
| GET | `/user/me` | `/api/user/me` | `useCurrentUser` | Query |
| PATCH | `/user/me` | `/api/user/me` | `useUpdateUser` | Mutation |

### Projects (entities/project)

| Метод | Backend | BFF Route | Хук | Тип |
|-------|---------|-----------|-----|-----|
| GET | `/projects` | `/api/projects` | `useProjects` | Query |
| GET | `/projects/:id` | `/api/projects/:id` | `useProject` | Query |
| POST | `/projects` | `/api/projects` | `useCreateProject` | Mutation |
| PATCH | `/projects/:id` | `/api/projects/:id` | `useUpdateProject` | Mutation |
| DELETE | `/projects/:id` | `/api/projects/:id` | `useDeleteProject` | Mutation |

### Interviews (entities/interview)

| Метод | Backend | BFF Route | Хук | Тип |
|-------|---------|-----------|-----|-----|
| GET | `/interviews/projects/:projectId` | `/api/interviews/projects/:projectId` | `useInterviews` | Query |
| GET | `/interviews/:id` | `/api/interviews/:id` | `useInterview` | Query |
| POST | `/interviews/projects/:projectId/upload` | `/api/interviews/projects/:projectId/upload` | `useUploadInterview` | Mutation |
| PATCH | `/interviews/:id` | `/api/interviews/:id` | `useUpdateInterview` | Mutation |
| DELETE | `/interviews/:id` | `/api/interviews/:id` | `useDeleteInterview` | Mutation |

---

## 🔑 Query Keys Strategy

```typescript
// src/shared/api/query-keys.ts

export const queryKeys = {
  // User
  user: {
    current: () => ['user', 'current'] as const,
  },

  // Projects
  projects: {
    all: () => ['projects'] as const,
    list: (params: { search?: string; offset?: number; limit?: number }) =>
      ['projects', 'list', params] as const,
    detail: (id: number) => ['projects', 'detail', id] as const,
  },

  // Interviews
  interviews: {
    all: () => ['interviews'] as const,
    byProject: (projectId: number) =>
      ['interviews', 'project', projectId] as const,
    list: (
      projectId: number,
      params: { search?: string; offset?: number; limit?: number }
    ) => ['interviews', 'project', projectId, 'list', params] as const,
    detail: (id: number) => ['interviews', 'detail', id] as const,
  },
} as const;
```

### Инвалидация

| Действие | Инвалидируемые ключи |
|----------|---------------------|
| Login/Logout | `user.current`, все данные |
| Update user | `user.current` |
| Create project | `projects.all` |
| Update project | `projects.detail(id)`, `projects.all` |
| Delete project | `projects.all` |
| Upload interview | `interviews.byProject(projectId)` |
| Update interview | `interviews.detail(id)`, `interviews.byProject` |
| Delete interview | `interviews.byProject(projectId)` |

---

## ⏱️ Кеширование

| Данные | staleTime | gcTime | Refetch On |
|--------|-----------|--------|------------|
| Current User | 5 min | 30 min | Window focus |
| Projects List | 1 min | 10 min | Window focus |
| Project Detail | 2 min | 10 min | — |
| Interviews List | 30 sec | 5 min | Window focus |
| Interview Detail | 1 min | 5 min | — |

### Глобальные defaults

```typescript
// src/shared/api/query-client.ts

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});
```

---

## 🔐 BFF Routes

### Принцип работы

1. Клиент отправляет запрос на `/api/*` (BFF)
2. BFF читает `access_token` из httpOnly cookie
3. BFF проксирует запрос на бэкенд с `Authorization: Bearer <token>`
4. При 401 — автоматический refresh токена
5. BFF возвращает ответ клиенту

### Cookie Configuration

```typescript
// Константы для cookies
const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days for refresh
};
```

### Пример BFF route

```typescript
// src/app/api/projects/route.ts

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  
  const response = await fetch(
    `${API_URL}/projects?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (response.status === 401) {
    // TODO: Implement token refresh logic
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
```

---

## 🔄 WebSocket интеграция

### Назначение

WebSocket используется для отслеживания статуса интервью в реальном времени:
- `uploaded` → `processing` → `done`/`error`

### Структура

```
src/
├── shared/
│   └── lib/
│       └── websocket/
│           ├── interview-socket.ts   # WebSocket client
│           ├── use-interview-status.ts # React hook
│           └── index.ts
```

### Использование

```typescript
// В компоненте списка интервью
const { status, isConnected } = useInterviewStatus(interviewId, {
  enabled: interview.status === 'processing',
  onStatusChange: (newStatus) => {
    // Инвалидация кеша при изменении статуса
    queryClient.invalidateQueries({
      queryKey: queryKeys.interviews.detail(interviewId),
    });
  },
});
```

### События WebSocket

| Event | Payload | Описание |
|-------|---------|----------|
| `interview:status` | `{ id, status, progress? }` | Обновление статуса |
| `interview:error` | `{ id, error }` | Ошибка обработки |
| `interview:complete` | `{ id, result }` | Завершение обработки |

---

## 📅 Фазы реализации

### Фаза 1: Инфраструктура 🔴

- [ ] Установка зависимостей (@tanstack/react-query, zod, axios)
- [ ] Настройка Axios client с interceptors
- [ ] Создание QueryClient и Provider
- [ ] Zod схемы из OpenAPI
- [ ] Query keys factory

### Фаза 2: Auth 🔴

- [ ] BFF routes для auth (login, register, logout, refresh)
- [ ] Cookie management
- [ ] useLogin, useRegister, useLogout хуки
- [ ] Интеграция с auth-store (Zustand)
- [ ] Обновление login page

### Фаза 3: User 🟡

- [ ] BFF routes для user
- [ ] entities/user структура
- [ ] useCurrentUser, useUpdateUser хуки
- [ ] Интеграция с UI (user dropdown)

### Фаза 4: Projects 🟡

- [ ] BFF routes для projects
- [ ] entities/project структура
- [ ] CRUD хуки с optimistic updates
- [ ] UI компоненты (list, card)

### Фаза 5: Interviews 🟢

- [ ] BFF routes для interviews
- [ ] entities/interview структура
- [ ] CRUD хуки + upload
- [ ] WebSocket для статусов
- [ ] UI компоненты

---

## 📚 Зависимости

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "axios": "^1.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "@tanstack/react-query-devtools": "^5.x"
  }
}
```

---

## 🔗 Связанные документы

- [AGENTS.md](../AGENTS.md) — Общие правила проекта
- [BFF.md](../BFF.md) — Backend for Frontend подробно
- [FSD-STRUCTURE.md](../FSD-STRUCTURE.md) — Структура по FSD
- [ZUSTAND.md](../ZUSTAND.md) — State management

---

**Последнее обновление:** 30 ноября 2025
