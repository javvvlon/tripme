# tripme_app

Frontend for TripMe: a **prerendered consumer landing**, a **tour search**, a
**B2B agent funnel** and a **SPA agent CRM** — from one codebase.

Nuxt 4 · Vue 3 · TypeScript · SCSS. No UI framework.

The application architecture (module registry, resources, models, mappers,
intentions, repositories) is a port of the layering used in `sanara/front`,
expressed in Vue idiom. Rendering strategy implements §3.4/§3.5 of
`TripMe-Architecture-v5.md`.

## Запуск

```bash
nvm use            # Node 22 — Nuxt 4.5 refuses to build on Node 20
npm install
npm run dev        # http://localhost:3000 → /ru
npm run build
npm run typecheck
node .output/server/index.mjs
```

## Структура

```
src/
  landing/            публичный сайт: главная + поиск (SEO/SSR)
  search_engine/      общий слой данных: туры и направления
  modules/
    agents/           B2B-лендинг для турагентов
    auth/             вход и регистрация
    dashboard/        кабинет агента (SPA)
  shared/             ядро: контракты, helpers, http, компоненты, стили, i18n
  layouts/            default (consumer) · agents (B2B) · blank
  plugins/            http-коннектор, сериализация моделей
```

### Слои

Запрос всегда идёт по одной дорожке. Ни один компонент не знает про URL,
ни один репозиторий не знает про `snake_case`:

```
View            что показать; логики не содержит
 └ *.hooks.ts   состояние экрана
 └ *.config.ts  контент и константы экрана
Repository      именованные запросы, возвращает модели
 └ Intention    UI → API   (camelCase → snake_case)
 └ Model        API → UI   (mapRaw, методы предметной области)
HttpConnector   единственная точка выхода в сеть
 └ resources    какой URL у действия  (module/config/resources.ts)
 └ middlewares  токен, заголовки, ошибки
```

- **`shared/helpers/model.ts`** — `Model.fromRaw()` + `mapRaw()`. Переименование
  поля в API правится в одном файле на сущность и до компонентов не доходит.
- **`shared/helpers/intentions.ts`** — обратное направление: `Intention.toRequest()`.
- **`shared/services/api/service.ts`** — `HttpConnector.call(resource, action, params, body)`.
  Репозиторий не собирает URL: он называет ресурс и действие.
- **`shared/bootstrap/`** — `IModule` + `AppBootstrap`. Реестр модулей читается
  **дважды из одного списка**: в `nuxt.config.ts` на сборке (маршруты → страницы
  Nuxt, режим рендеринга) и в `plugins/http.ts` в рантайме (ресурсы → коннектор).
  Новый модуль — одна строка в `src/modules/index.ts`.

### Маршруты принадлежат модулям

Каталога `src/pages/` нет. Модуль объявляет свои маршруты сам, вместе с режимом
рендеринга — `src/landing/config/routes.ts`:

```ts
{ name: 'landing-home', path: '/', file: 'landing/views/home/Home.vue', prerender: true }
```

Хук `pages:extend` в `nuxt.config.ts` превращает это в маршруты Nuxt, а
`routeRules` — в режим рендеринга. `@nuxtjs/i18n` домножает каждый маршрут на локаль.

| Маршрут | Рендеринг | Почему |
|---|---|---|
| `/{locale}` | prerender | главная, индексируется |
| `/{locale}/agents` | prerender | B2B-лендинг, индексируется |
| `/{locale}/search` | SSR | зависит от query и живых цен; `noindex, follow` |
| `/{locale}/auth`, `/{locale}/app` | SPA (`ssr: false`) | за логином, индексировать нечего |

## Компоненты

Общий компонент — папка из четырёх файлов:

```
shared/components/button/
  Button.vue        template → script → style (в style только импорт)
  _button.scss      стили; токены через @use '../../styles/utils'
  Button.d.ts       интерфейс пропсов
  Button.config.ts  константы, если нужны
```

`shared/components/**` автоимпортируются без префикса (`<Button>`, `<Photo>`).
Компоненты внутри модуля импортируются явно — так видно, что они не для
переиспользования.

**Правило размещения.** Если компонент нужен и лендингу, и модулям — он в
`shared/`. Если он привязан к контексту (форма заявки агента, шапка B2B) — он
в `components/` своего модуля.

Сейчас в `shared/`: `Accordion` `Badge` `Breadcrumbs` `Button` `Checkbox` `Chip`
`FilterPanel` `Icon` `LangSwitcher` `Photo` `PriceRange` `Rating` `Score`
`SearchField` `SearchWidget` `SectionHead` `Tabs` `TourCard`.

## Дизайн-система

`src/shared/styles/utils/` — один источник правды для лендинга и модулей:

- `_colors.scss` — карта `$colors`; синий = навигация и идентичность,
  оранжевый = единственное действие, которое мы хотим нажать
- `_typography.scss`, `_layout.scss` (радиусы, тени, контейнеры), `_breakpoints.scss`
- `_mixins.scss` — `color()`, `radius()`, `shadow()`, `container()`, `line-clamp()`
- `_root.scss` — выгружает все карты в `:root` как `--tm-*`

Компоненты используют **семантические** переменные (`--tm-surface-1`,
`--tm-ink-2`, `--tm-border-1`), а не сырую шкалу. Поэтому тёмная тема — это
переопределение токенов, а не правка двадцати компонентов.

## Языки

`ru` (по умолчанию), `uz`, `en`. Стратегия `prefix`: у каждого языка свой URL
(`/ru/...`, `/uz/...`, `/en/...`) — иначе `hreflang` бессмысленен и в индекс
попадает только один язык.

- Сообщения: `src/shared/i18n/locales/*.json`
- Множественное число: `src/shared/i18n/i18n.config.ts` — у русского четыре
  формы, у узбекского одна. Правило вынесено туда, потому что «2 ночей» на
  главном контроле сайта видно всем.
- Контент в конфигах хранит **ключи**, не строки (`titleKey`, `labelKey`).

## Что проверено на этой сборке

Прогнано, а не «должно работать»:

| Проверка | Результат |
|---|---|
| `npm run build` | проходит |
| `npm run typecheck` | 0 ошибок |
| Предрендер | 15 маршрутов: `/{ru,uz,en}` и `/{ru,uz,en}/agents` |
| `/ru` | 46 487 байт, ~1 800 знаков видимого текста в HTML |
| `<html lang>` и `hreflang` | `ru-RU` / `uz-UZ` / `en-US`, 7 alternate-ссылок |
| Множественное число | «3 ночи», «5 ночей», «1 взрослый», «2 взрослых» |
| `/ru/search` | 200, 8 карточек, 6 групп фильтров, гистограмма, `noindex` |
| Хлебные крошки | BreadcrumbList JSON-LD на странице поиска |
| Главная | TravelAgency + SearchAction JSON-LD, canonical |
| `/{ru,uz,en}/agents` | 200, ~5 300 знаков текста, ответы FAQ в HTML в свёрнутом виде |
| `POST /api/apply` | 200 на валидном теле, **400** без согласия и на пустом |
| `/ru/app`, `/ru/auth` | 200, 0 серверного текста — так и задумано |
| Несуществующий маршрут | 404 |

## Известные ограничения

1. **Node 22+.** Nuxt 4.5 не собирается на Node 20: парсер `definePageMeta`
   грузится через `require()` ESM-модуля. Версия зафиксирована в `.nvmrc` и `engines`.
2. **Предрендеренные страницы отдаёт не node-сервер.** Файлы в `.output/public`
   генерируются правильно, но `node .output/server/index.mjs` рендерит их заново
   (~300 мс вместо отдачи готового HTML). В проде перед сервером всё равно стоит
   nginx/CDN: отдавайте `.output/public` статикой, остальное проксируйте на Node —
   тогда лендинг уходит без участия сервера, как и задумано в §3.4.
3. **`agents.*` только по-русски.** Аудитория B2B читает по-русски, а машинный
   перевод пятидесяти строк продающего текста хуже отсутствия перевода.
   `fallbackLocale: 'ru'` отдаёт русский на `/uz/agents` и `/en/agents`.
   Узбекский и английский для потребительской части написаны, но их
   **должен вычитать носитель языка**.
4. **Живого API нет.** `search_engine` вызывает `tripme_api`; пока он не отвечает,
   `Home.hooks.ts` и `Search.hooks.ts` показывают образцы из `*.config.ts`.
   Каждый такой блок помечен — удаляется вместе с `try/catch`.
   На странице агентов образцы честно помечены плашкой «пример».
5. **Фотографий нет.** Карточки рисуют тонированную заглушку в правильных
   пропорциях. Подставить реальные — это изменение данных, а не разметки.
6. **`/search` не делает автодополнение.** Поля «Откуда/Куда» принимают текст;
   `search_engine/repositories/destinations.repository.ts` уже умеет `suggest()`,
   осталось подключить выпадающий список.

## Что дальше

1. Подключить `tripme_api` — убрать fallback-блоки из `*.hooks.ts`.
2. SEO-страницы направлений `/tours/{slug}` — под них уже сделана перелинковка
   в футере; именно они, а не `/search`, должны попадать в индекс.
3. Автодополнение направлений в поиске.
4. Реальные фотографии и `nuxt-image`.
5. Кабинет агента в `modules/dashboard` — ресурсы объявлены, вьюхи нет.
6. Отдать `agents.*` на перевод, узбекский и английский — на вычитку.
