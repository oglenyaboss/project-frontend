# Zustand — State Management Guide

## 📦 Что это?

**Zustand** — минималистичная библиотека для управления глобальным состоянием в React приложениях. Легковесная альтернатива Redux, Mobx и Context API.

## ✨ Преимущества

- ✅ Минимальный boilerplate (меньше кода)
- ✅ Не требует провайдеров (нет Context hell)
- ✅ TypeScript из коробки
- ✅ Middleware для персистентности и devtools
- ✅ Оптимизация ре-рендеров через селекторы
- ✅ Простое API

## 📁 Структура в проекте

```
src/
└── shared/
    └── store/
        ├── auth-store.ts      # Auth состояние
        ├── ui-store.ts        # UI состояние (theme, sidebar)
        ├── cart-store.ts      # Корзина (пример)
        └── index.ts           # Public API
```

---

## 🎯 Базовое использование

### 1. Создание простого store

```typescript
// src/shared/store/counter-store.ts
import { create } from "zustand";

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

### 2. Использование в компонентах

```typescript
"use client";

import { useCounterStore } from "@/shared/store";

export function Counter() {
  const { count, increment, decrement, reset } = useCounterStore();

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+1</button>
      <button onClick={decrement}>-1</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

---

## 🚀 Продвинутые возможности

### 1. Селекторы (оптимизация ре-рендеров)

```typescript
// ❌ Плохо — компонент ре-рендерится при любом изменении store
function BadComponent() {
  const store = useCounterStore();
  return <div>{store.count}</div>;
}

// ✅ Хорошо — ре-рендер только при изменении count
function GoodComponent() {
  const count = useCounterStore((state) => state.count);
  return <div>{count}</div>;
}

// ✅ Отлично — множественные селекторы
function BestComponent() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);

  return (
    <div>
      {count}
      <button onClick={increment}>+</button>
    </div>
  );
}
```

### 2. Async actions

```typescript
interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;

  fetchTodos: () => Promise<void>;
  addTodo: (todo: Todo) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/todos");
      const data = await response.json();

      set({ todos: data, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error",
        isLoading: false,
      });
    }
  },

  addTodo: async (todo) => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        body: JSON.stringify(todo),
      });

      const newTodo = await response.json();

      set((state) => ({
        todos: [...state.todos, newTodo],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Error",
        isLoading: false,
      });
    }
  },
}));
```

### 3. Persist middleware (localStorage)

```typescript
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SettingsState {
  theme: "light" | "dark";
  language: string;
  setTheme: (theme: "light" | "dark") => void;
  setLanguage: (lang: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: "light",
      language: "ru",

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: "settings-storage", // ключ в localStorage
      storage: createJSONStorage(() => localStorage),

      // Опционально: выбираем, что сохранять
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
      }),
    }
  )
);
```

### 4. Вложенные объекты (immer middleware)

```typescript
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface UserState {
  profile: {
    name: string;
    email: string;
    settings: {
      notifications: boolean;
      theme: string;
    };
  };
  updateName: (name: string) => void;
  toggleNotifications: () => void;
}

export const useUserStore = create<UserState>()(
  immer((set) => ({
    profile: {
      name: "",
      email: "",
      settings: {
        notifications: true,
        theme: "light",
      },
    },

    // С immer можно мутировать напрямую
    updateName: (name) =>
      set((state) => {
        state.profile.name = name;
      }),

    toggleNotifications: () =>
      set((state) => {
        state.profile.settings.notifications =
          !state.profile.settings.notifications;
      }),
  }))
);
```

---

## 🔐 Auth Store (реальный пример из проекта)

```typescript
// src/shared/store/auth-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error?.message || "Ошибка авторизации");
          }

          set({
            user: result.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Ошибка сети";
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: errorMessage,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });

        try {
          await fetch("/api/auth/logout", { method: "POST" });

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error("Logout error:", error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      fetchUser: async () => {
        if (get().user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await fetch("/api/auth/me");
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error?.message || "Не авторизован");
          }

          set({
            user: result.data,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
    }
  )
);
```

### Использование Auth Store

```typescript
"use client";

import { useAuthStore } from "@/shared/store";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async (values: { email: string; password: string }) => {
    clearError();

    try {
      await login(values);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div>
      {error && <div className="error">{error}</div>}
      <button onClick={() => handleLogin({ email: "...", password: "..." })}>
        {isLoading ? "Загрузка..." : "Войти"}
      </button>
    </div>
  );
}
```

---

## 🎨 UI Store (пример для theme, sidebar)

```typescript
// src/shared/store/ui-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface UIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  setTheme: (theme: "light" | "dark" | "system") => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      sidebarOpen: true,
      sidebarCollapsed: false,

      setTheme: (theme) => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleSidebarCollapse: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

---

## 📚 Best Practices

### 1. Организация stores

```typescript
// ✅ Правильно — один store на область
src/shared/store/
  ├── auth-store.ts      # Авторизация
  ├── cart-store.ts      # Корзина
  ├── ui-store.ts        # UI состояние
  └── index.ts           # Экспорты

// ❌ Неправильно — один огромный store
src/shared/store/
  └── global-store.ts    # Всё в одном (плохо!)
```

### 2. Типизация

```typescript
// ✅ Правильно — явная типизация
interface MyState {
  value: string;
  setValue: (v: string) => void;
}

export const useMyStore = create<MyState>()((set) => ({
  value: "",
  setValue: (value) => set({ value }),
}));

// ❌ Неправильно — без типов
export const useMyStore = create((set) => ({
  value: "",
  setValue: (value) => set({ value }),
}));
```

### 3. Именование actions

```typescript
// ✅ Правильно — глаголы
interface State {
  fetchUsers: () => void;
  addUser: (user: User) => void;
  removeUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
}

// ❌ Неправильно — существительные
interface State {
  users: () => void; // непонятно
  user: (user: User) => void;
}
```

### 4. Разделение ответственности

```typescript
// ✅ Правильно — каждый store отвечает за свою область
const auth = useAuthStore();
const cart = useCartStore();
const ui = useUIStore();

// ❌ Неправильно — всё в одном store
const global = useGlobalStore();
global.user;
global.cart;
global.theme;
global.everything;
```

### 5. Когда НЕ использовать Zustand

```typescript
// ❌ Локальное состояние компонента
// Используйте useState
function Component() {
  const [localValue, setLocalValue] = useState("");
  // ...
}

// ❌ Состояние формы
// Используйте react-hook-form
import { useForm } from "react-hook-form";

function Form() {
  const form = useForm();
  // ...
}

// ✅ Глобальное состояние, доступное многим компонентам
// Используйте Zustand
const { user } = useAuthStore();
```

---

## 🔗 Полезные ссылки

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [Zustand Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)

---

**Последнее обновление:** 29 октября 2025  
**Статус:** Активно используется в проекте
