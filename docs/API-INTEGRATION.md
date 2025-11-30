# API Integration Plan

> Документация по интеграции с бэкендом через TanStack Query

**Дата создания:** 30 ноября 2025  
**Статус:** ✅ Реализовано

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

| Вопрос                 | Решение                     | Обоснование                  |
| ---------------------- | --------------------------- | ---------------------------- |
| **Хранение токенов**   | httpOnly cookies через BFF  | Безопасность от XSS атак     |
| **BFF**                | Да, Next.js API Routes      | Скрытие токенов от клиента   |
| **Optimistic Updates** | Да (для CRUD операций)      | Лучший UX без изменений бэка |
| **Пагинация**          | Классическая (offset/limit) | Соответствует API            |
| **Polling/Realtime**   | WebSocket                   | Для статусов интервью        |
| **Типизация**          | Zod схемы (ручные)          | Контроль + валидация         |

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

| Метод | Backend          | BFF Route            | Хук           | Тип      |
| ----- | ---------------- | -------------------- | ------------- | -------- |
| POST  | `/auth/register` | `/api/auth/register` | `useRegister` | Mutation |
| POST  | `/auth/login`    | `/api/auth/login`    | `useLogin`    | Mutation |
| POST  | `/auth/logout`   | `/api/auth/logout`   | `useLogout`   | Mutation |
| POST  | `/auth/refresh`  | `/api/auth/refresh`  | (internal)    | Mutation |

### User (entities/user)

| Метод | Backend    | BFF Route      | Хук              | Тип      |
| ----- | ---------- | -------------- | ---------------- | -------- |
| GET   | `/user/me` | `/api/user/me` | `useCurrentUser` | Query    |
| PATCH | `/user/me` | `/api/user/me` | `useUpdateUser`  | Mutation |

### Projects (entities/project)

| Метод  | Backend         | BFF Route           | Хук                | Тип      |
| ------ | --------------- | ------------------- | ------------------ | -------- |
| GET    | `/projects`     | `/api/projects`     | `useProjects`      | Query    |
| GET    | `/projects/:id` | `/api/projects/:id` | `useProject`       | Query    |
| POST   | `/projects`     | `/api/projects`     | `useCreateProject` | Mutation |
| PATCH  | `/projects/:id` | `/api/projects/:id` | `useUpdateProject` | Mutation |
| DELETE | `/projects/:id` | `/api/projects/:id` | `useDeleteProject` | Mutation |

### Interviews (entities/interview)

| Метод  | Backend                                  | BFF Route                                    | Хук                  | Тип      |
| ------ | ---------------------------------------- | -------------------------------------------- | -------------------- | -------- |
| GET    | `/interviews/projects/:projectId`        | `/api/interviews/projects/:projectId`        | `useInterviews`      | Query    |
| GET    | `/interviews/:id`                        | `/api/interviews/:id`                        | `useInterview`       | Query    |
| POST   | `/interviews/projects/:projectId/upload` | `/api/interviews/projects/:projectId/upload` | `useUploadInterview` | Mutation |
| PATCH  | `/interviews/:id`                        | `/api/interviews/:id`                        | `useUpdateInterview` | Mutation |
| DELETE | `/interviews/:id`                        | `/api/interviews/:id`                        | `useDeleteInterview` | Mutation |

---

## 🔑 Query Keys Strategy

```typescript
// src/shared/api/query-keys.ts

export const queryKeys = {
  // User
  user: {
    current: () => ["user", "current"] as const,
  },

  // Projects
  projects: {
    all: () => ["projects"] as const,
    list: (params: { search?: string; offset?: number; limit?: number }) =>
      ["projects", "list", params] as const,
    detail: (id: number) => ["projects", "detail", id] as const,
  },

  // Interviews
  interviews: {
    all: () => ["interviews"] as const,
    byProject: (projectId: number) =>
      ["interviews", "project", projectId] as const,
    list: (
      projectId: number,
      params: { search?: string; offset?: number; limit?: number }
    ) => ["interviews", "project", projectId, "list", params] as const,
    detail: (id: number) => ["interviews", "detail", id] as const,
  },
} as const;
```

### Инвалидация

| Действие         | Инвалидируемые ключи                            |
| ---------------- | ----------------------------------------------- |
| Login/Logout     | `user.current`, все данные                      |
| Update user      | `user.current`                                  |
| Create project   | `projects.all`                                  |
| Update project   | `projects.detail(id)`, `projects.all`           |
| Delete project   | `projects.all`                                  |
| Upload interview | `interviews.byProject(projectId)`               |
| Update interview | `interviews.detail(id)`, `interviews.byProject` |
| Delete interview | `interviews.byProject(projectId)`               |

---

## ⏱️ Кеширование

| Данные           | staleTime | gcTime | Refetch On   |
| ---------------- | --------- | ------ | ------------ |
| Current User     | 5 min     | 30 min | Window focus |
| Projects List    | 1 min     | 10 min | Window focus |
| Project Detail   | 2 min     | 10 min | —            |
| Interviews List  | 30 sec    | 5 min  | Window focus |
| Interview Detail | 1 min     | 5 min  | —            |

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
const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days for refresh
};
```

### Пример BFF route

```typescript
// src/app/api/projects/route.ts

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.API_URL;

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
  enabled: interview.status === "processing",
  onStatusChange: (newStatus) => {
    // Инвалидация кеша при изменении статуса
    queryClient.invalidateQueries({
      queryKey: queryKeys.interviews.detail(interviewId),
    });
  },
});
```

### События WebSocket

| Event                | Payload                     | Описание             |
| -------------------- | --------------------------- | -------------------- |
| `interview:status`   | `{ id, status, progress? }` | Обновление статуса   |
| `interview:error`    | `{ id, error }`             | Ошибка обработки     |
| `interview:complete` | `{ id, result }`            | Завершение обработки |

---

## 📅 Фазы реализации

### Фаза 1: Инфраструктура ✅

- [x] Установка зависимостей (@tanstack/react-query, zod, axios)
- [x] Настройка Axios client с interceptors
- [x] Создание QueryClient и Provider
- [x] Zod схемы из OpenAPI
- [x] Query keys factory

### Фаза 2: Auth ✅

- [x] BFF routes для auth (login, register, logout, refresh)
- [x] Cookie management
- [x] useLogin, useRegister, useLogout хуки
- [x] Интеграция с auth-store (Zustand)
- [ ] Обновление login page (UI)

### Фаза 3: User ✅

- [x] BFF routes для user
- [x] entities/user структура
- [x] useCurrentUser, useUpdateUser хуки
- [ ] Интеграция с UI (user dropdown)

### Фаза 4: Projects ✅

- [x] BFF routes для projects
- [x] entities/project структура
- [x] CRUD хуки с optimistic updates
- [ ] UI компоненты (list, card)

### Фаза 5: Interviews ✅

- [x] BFF routes для interviews
- [x] entities/interview структура
- [x] CRUD хуки + upload
- [x] WebSocket для статусов
- [ ] UI компоненты

---

## 🎯 Оставшаяся работа (UI интеграция)

> API слой полностью готов. Осталось интегрировать хуки в UI компоненты.

### Приоритеты

| Задача                       | Приоритет  | Сложность | Файлы                                           |
| ---------------------------- | ---------- | --------- | ----------------------------------------------- |
| Middleware для защиты роутов | 🔴 Высокий | Низкая    | `src/middleware.ts`                             |
| Обновить форму логина        | 🔴 Высокий | Средняя   | `src/app/login/page.tsx`                        |
| Интеграция user в sidebar    | 🔴 Высокий | Низкая    | `widgets/app-sidebar`, `features/user-dropdown` |
| Dashboard с проектами        | 🟡 Средний | Средняя   | `src/app/dashboard/page.tsx`                    |
| Страница проекта с интервью  | 🟡 Средний | Средняя   | `src/app/projects/[id]/page.tsx`                |
| Страница регистрации         | 🟢 Низкий  | Низкая    | `src/app/register/page.tsx`                     |
| Toast уведомления            | 🟢 Низкий  | Низкая    | `src/shared/ui/toast.tsx`                       |

---

### 1. Middleware для защиты роутов

Создать `src/middleware.ts` для проверки аутентификации:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register"];
const AUTH_ROUTES = ["/login", "/register"]; // Редирект на dashboard если залогинен

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  // Публичные API routes пропускаем
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Если не авторизован и не на публичной странице → login
  if (
    !accessToken &&
    !PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Если авторизован и на auth странице → dashboard
  if (accessToken && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
```

---

### 2. Обновить форму логина

Интегрировать `useLogin` хук в форму:

```typescript
// src/app/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/features/auth";
import { loginRequestSchema, type LoginRequest } from "@/shared/lib/schemas";
import {
  Button,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/shared/ui";

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();

  const form = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginRequest) => {
    login(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error.message}</p>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Вход..." : "Войти"}
        </Button>
      </form>
    </Form>
  );
}
```

**Зависимость:** Нужен `@hookform/resolvers`:

```bash
npm install @hookform/resolvers
```

---

### 3. Интеграция user в sidebar

Заменить моки на реальные данные в `user-dropdown.tsx`:

```typescript
// src/features/user-dropdown/ui/user-dropdown.tsx
"use client";

import { useCurrentUser } from "@/entities/user";
import { useLogout } from "@/features/auth";
import {
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
} from "@/shared/ui";
import { LogOut, Settings, User } from "lucide-react";

export function UserDropdown() {
  const { data: user, isLoading } = useCurrentUser();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (isLoading) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  if (!user) return null;

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg p-2 hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{user.name || user.email}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          Профиль
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          Настройки
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {isLoggingOut ? "Выход..." : "Выйти"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

### 4. Dashboard с проектами

Создать UI для списка проектов:

```typescript
// src/app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { useProjects, useCreateProject } from "@/entities/project";
import {
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Skeleton,
} from "@/shared/ui";
import { Plus, Search } from "lucide-react";

// Компонент карточки проекта (создать в entities/project/ui/)
import { ProjectCard } from "@/entities/project";

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const { data: projects, isLoading, error } = useProjects({ search });
  const createProject = useCreateProject();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Мои проекты</h1>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Новый проект
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать проект</DialogTitle>
            </DialogHeader>
            {/* CreateProjectForm */}
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Поиск проектов..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <p className="text-destructive">Ошибка загрузки проектов</p>
      ) : projects?.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Нет проектов</p>
          <Button>Создать первый проект</Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Нужно создать:**

- `src/entities/project/ui/project-card.tsx` — карточка проекта
- `src/features/create-project/` — форма создания проекта
- `src/features/edit-project/` — форма редактирования
- `src/features/delete-project/` — подтверждение удаления

---

### 5. Страница проекта с интервью

```typescript
// src/app/projects/[id]/page.tsx
"use client";

import { use } from "react";
import { useProject } from "@/entities/project";
import { useInterviews, useUploadInterview } from "@/entities/interview";
import { Button, Skeleton } from "@/shared/ui";
import { Upload } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function ProjectPage({ params }: Props) {
  const { id } = use(params);
  const projectId = parseInt(id, 10);

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: interviews, isLoading: interviewsLoading } =
    useInterviews(projectId);
  const uploadInterview = useUploadInterview();

  const handleFileUpload = (files: FileList) => {
    const file = files[0];
    if (file) {
      uploadInterview.mutate({ projectId, file });
    }
  };

  if (projectLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{project?.name}</h1>
        <p className="text-muted-foreground">{project?.description}</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Интервью</h2>
        <Button asChild>
          <label className="cursor-pointer">
            <Upload className="mr-2 h-4 w-4" />
            Загрузить интервью
            <input
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={(e) =>
                e.target.files && handleFileUpload(e.target.files)
              }
            />
          </label>
        </Button>
      </div>

      {interviewsLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : interviews?.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          Нет интервью. Загрузите первое интервью.
        </p>
      ) : (
        <div className="space-y-4">
          {interviews?.map((interview) => (
            <InterviewCard
              key={interview.id}
              interview={interview}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Нужно создать:**

- `src/entities/interview/ui/interview-card.tsx` — карточка интервью
- `src/entities/interview/ui/interview-status-badge.tsx` — бейдж статуса с WebSocket

---

### 6. WebSocket интеграция в UI

Использование хука `useInterviewStatus` в карточке интервью:

```typescript
// src/entities/interview/ui/interview-card.tsx
"use client";

import { useInterviewStatus } from "@/entities/interview";
import { Badge } from "@/shared/ui";
import { Loader2 } from "lucide-react";

interface Props {
  interview: Interview;
  projectId: number;
}

export function InterviewCard({ interview, projectId }: Props) {
  // Подключаем WebSocket только для processing статуса
  const { status, isConnected } = useInterviewStatus(interview.id, {
    enabled: interview.status === "processing",
  });

  const currentStatus = status || interview.status;

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{interview.filename}</h3>
        <InterviewStatusBadge
          status={currentStatus}
          isConnected={isConnected}
        />
      </div>
    </div>
  );
}

function InterviewStatusBadge({
  status,
  isConnected,
}: {
  status: string;
  isConnected?: boolean;
}) {
  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    uploaded: { variant: "secondary", label: "Загружено" },
    processing: { variant: "default", label: "Обработка" },
    done: { variant: "outline", label: "Готово" },
    error: { variant: "destructive", label: "Ошибка" },
  };

  const { variant, label } = variants[status] || variants.uploaded;

  return (
    <Badge variant={variant} className="flex items-center gap-1">
      {status === "processing" && <Loader2 className="h-3 w-3 animate-spin" />}
      {label}
      {status === "processing" && isConnected && (
        <span className="ml-1 h-2 w-2 rounded-full bg-green-500" />
      )}
    </Badge>
  );
}
```

---

### 7. Toast уведомления

Установить и настроить sonner для уведомлений:

```bash
npx shadcn@latest add sonner
```

Добавить в layout и использовать в мутациях:

```typescript
// В мутациях
import { toast } from "sonner";

const createProject = useCreateProject();

const handleCreate = (data: CreateProjectRequest) => {
  createProject.mutate(data, {
    onSuccess: () => {
      toast.success("Проект создан");
    },
    onError: (error) => {
      toast.error(error.message || "Ошибка создания проекта");
    },
  });
};
```

---

### 8. Страница регистрации

```typescript
// src/app/register/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "@/features/auth";
import {
  registerRequestSchema,
  type RegisterRequest,
} from "@/shared/lib/schemas";
import Link from "next/link";

export default function RegisterPage() {
  const { mutate: register, isPending, error } = useRegister();

  const form = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  const onSubmit = (data: RegisterRequest) => {
    register(data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-6 p-8">
        <h1 className="text-2xl font-bold text-center">Регистрация</h1>

        {/* Форма аналогична LoginPage */}

        <p className="text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
```

---

### Чеклист UI интеграции

- [x] Создать `src/middleware.ts`
- [x] Установить `@hookform/resolvers`
- [x] Обновить `src/app/login/page.tsx`
- [x] Обновить `src/features/user-dropdown/ui/user-dropdown.tsx`
- [x] Создать `src/entities/project/ui/project-card.tsx`
- [x] Обновить `src/app/dashboard/page.tsx`
- [x] Создать `src/app/projects/[id]/page.tsx`
- [x] Создать `src/entities/interview/ui/interview-card.tsx`
- [x] Создать `src/entities/interview/ui/interview-status-badge.tsx`
- [x] Установить sonner: `npx shadcn@latest add sonner`
- [x] Добавить Toaster в layout
- [x] Создать `src/app/register/page.tsx`
- [ ] Обновить AGENTS.md с новыми entities

---

## 📚 Зависимости

```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.x",
    "@hookform/resolvers": "^3.x",
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
