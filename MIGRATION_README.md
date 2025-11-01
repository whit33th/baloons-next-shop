# Миграция в Next.js App Router

## Что было сделано

### 1. Структура проекта

- Создана папка `/components-next` для переиспользуемых компонентов
- Мигрированы все страницы в App Router структуру
- Обновлены импорты и пути

### 2. Переиспользуемые компоненты (в `/components-next`)

- `Header.tsx` - шапка сайта с навигацией
- `ProductGrid.tsx` - сетка продуктов с пагинацией
- `ProductFilters.tsx` - фильтры для поиска продуктов
- `Pagination.tsx` - компонент пагинации
- `SignOutButton.tsx` - кнопка выхода

### 3. Страницы (в App Router)

- `/` - главная страница магазина
- `/admin` - админ панель
- `/profile` - профиль пользователя
- `/products/[id]` - детали продукта
- `/cart` - корзина
- `/checkout` - оформление заказа
- `/order-confirmation/[id]` - подтверждение заказа

### 4. Настройка

- Добавлен `ConvexProvider` в layout
- Добавлен `Toaster` для уведомлений
- Установлена зависимость `sonner`
- Создан файл конфигурации `convex.json`

## Что нужно настроить

### 1. Переменные окружения

Создайте файл `.env.local` с следующими переменными:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment-url.convex.cloud

# Auth (если используется)
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain.com
```

### 2. Convex настройка

1. Установите Convex CLI: `npm install -g convex`
2. Войдите в аккаунт: `convex login`
3. Инициализируйте проект: `convex dev`
4. Скопируйте URL из вывода команды в `.env.local`

### 3. Запуск проекта

```bash
pnpm install
pnpm dev
```

## Структура файлов

```
app/
├── page.tsx                    # Главная страница
├── admin/page.tsx             # Админ панель
├── profile/page.tsx           # Профиль пользователя
├── products/[id]/page.tsx     # Детали продукта
├── cart/page.tsx             # Корзина
├── checkout/page.tsx         # Оформление заказа
├── order-confirmation/[id]/page.tsx # Подтверждение заказа
└── layout.tsx                 # Корневой layout

components-next/
├── Header.tsx                 # Шапка сайта
├── ProductGrid.tsx            # Сетка продуктов
├── ProductFilters.tsx         # Фильтры
├── Pagination.tsx             # Пагинация
└── SignOutButton.tsx          # Кнопка выхода

convex/
├── ConvexProvider.tsx         # Провайдер Convex
├── schema.ts                  # Схема базы данных
├── products.ts                # API продуктов
├── cart.ts                    # API корзины
├── orders.ts                  # API заказов
├── auth.ts                    # API аутентификации
└── ...                        # Остальные API файлы
```

## Особенности миграции

1. **App Router**: Все страницы используют новый App Router Next.js 16
2. **Client Components**: Все компоненты помечены как "use client"
3. **Навигация**: Используется Next.js навигация вместо состояния
4. **Переиспользуемость**: Компоненты разделены на страницы и переиспользуемые
5. **Типизация**: Сохранена полная типизация TypeScript

## Следующие шаги

1. Настройте переменные окружения
2. Инициализируйте Convex
3. Протестируйте все страницы
4. Настройте аутентификацию (если нужно)
5. Настройте Stripe для платежей (если нужно)
