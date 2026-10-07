# LEDVL: lighting-equipment store on Next.js and NestJS

**Demo:** https://ledvl-storefront.vercel.app — the frontend from this repository, built with `NEXT_PUBLIC_DEMO=1`. In that mode catalog, categories, filters and order creation are answered from `frontend/src/lib/demo-data.ts` through an axios adapter, so the site runs without the API and the database. The products there are written for the demo; the pages, the filter engine UI and the cart are the real code from `frontend/`.

Catalog of LED lighting for a Vladivostok supplier: street, industrial, office, low-voltage, trade and CRI97 fixtures, with a filter engine over a loaded price list, a cart, an admin panel and an Excel import pipeline. Next.js frontend, NestJS backend, PostgreSQL, MinIO for images, Docker Compose for the whole stack.

<table>
  <tr>
    <td width="50%"><img src=".github/assets/hero.jpg" alt="First screen of the landing page" /></td>
    <td width="50%"><img src=".github/assets/catalog.jpg" alt="Catalog with filter rail and product cards" /></td>
  </tr>
  <tr>
    <td colspan="2"><img src=".github/assets/category.jpg" alt="Price-list category: barcode, pack and box counts from the imported price list" /></td>
  </tr>
  <tr>
    <td><img src=".github/assets/about.jpg" alt="About page with values and figures" /></td>
    <td align="center"><img src=".github/assets/mobile.jpg" alt="Landing on a 390px viewport" width="300" /></td>
  </tr>
</table>

## Stack and size

| 8 730 | 44 + 28 | 9 | 3 | 8 | 9 |
| --- | --- | --- | --- | --- | --- |
| lines of TypeScript | backend + frontend files | Postgres tables | SQL migrations | TypeORM entities | API controllers under `/api/v1` |

Next.js 14.2 with React 18, Tailwind, framer-motion, react-hook-form, zustand with persisted cart, axios. NestJS 11 with TypeORM 0.3, passport-jwt, bcrypt, swagger, multer for uploads, Excel import. PostgreSQL 15 and MinIO in `docker-compose.yml`.

## How it is put together

```
backend/src/
  auth/        local strategy + bcrypt check, JWT issuing, JwtAuthGuard
  products/    catalog queries, filter engine, price-list join
  filters/     filter and filter-value CRUD used by the catalog UI
  categories/  category tree for the left rail
  import/      Excel price-list ingestion into price_list_entries
  upload/      product image upload
  storage/     S3 client against MinIO
  orders/      public order creation, admin list and status change
  cart/        server-side cart endpoint
  admin/       admin account management
  entities/    8 TypeORM entities
backend/migrations/   001-initial-schema, 002-add-filters, 003-add-featured-products
frontend/src/
  app/         pages: catalog, category, product, cart, checkout, admin, about, contacts, offer, privacy, requisites
  components/  Header, CatalogFilters, ProductCard, ProductForm, AdminFilters, ContactUs, Reviews, FAQ
  store/       zustand cart, persisted to localStorage
```

Product reads go through raw SQL with positional parameters (`$1..$n`) built from an id list, then price rows are joined from `price_list_entries` in one follow-up query. Filters use a TypeORM `QueryBuilder` with named parameters and AND semantics across filter groups, including `jsonb` spec matching with `ILIKE`. Admin mutations and order reads sit behind `JwtAuthGuard`; order creation and catalog reads are public.

## What this pass changed

The 2024 repo was published as a single commit with internal documents in the root. Before touching anything I ran the stack locally against PostgreSQL 14 and checked each item.

| Item | Before | After |
| --- | --- | --- |
| Production start | `nest build` also compiled `backend/scripts`, so output landed in `dist/src/main.js` while `npm run start:prod` launched `node dist/main`. The documented quick start failed with `MODULE_NOT_FOUND` | `tsconfig.build.json` includes only `src`, `dist/main.js` is where the script expects it |
| Checkout | The form's `onSubmit` was `console.log(data)`. The button said "Подтвердить заказ" and nothing happened, while `POST /api/v1/orders`, the `orders` table and the admin order list were all in place and permanently empty | The form posts `{items, customer_info, total}` to `/api/v1/orders`, shows the returned order number, clears the cart, and reports failures. Verified end to end in a browser: order row written, number rendered |
| Field validation | `required: true` with no error rendered anywhere, so a rejected submit was silent | Name and phone render their own messages, phone validated by digit count rather than a consecutive-digits pattern, so `+7 999 111 22 33` passes |
| Cart summary on checkout | absent | item count and total shown above the submit button |
| Internal documents | deployment runbooks and a letter addressed to the client sat in the repository root | removed; setup lives in `DEPLOYMENT.md` and this README |
| Environment template | variables documented only inside markdown | `backend/.env.example` and `frontend/.env.example` |
| History | one commit, author email not tied to a GitHub account | split into reviewable commits under the account email |

The second pass was to get the frontend deployable and viewable on its own. `next build` had never been run on this code: it stopped on type errors, and after those, on a prerender error and on ESLint.

| Item | Before | After |
| --- | --- | --- |
| Type check | three different `Product` interfaces in `ProductCard`, `FeaturedProducts` and the product page, plus two `Category` copies. `ProductCard` rendered `product.barcode` although its own interface had no such field, so `next build` failed on it | one `frontend/src/lib/types.ts` contract, imported by all read-side components |
| `/catalog` prerender | `useSearchParams()` outside a Suspense boundary: `Error occurred prerendering page "/catalog"`, export aborted | the view moved behind a `<Suspense>` boundary with a spinner fallback, 14 routes export clean |
| Lint gate | `react/no-unescaped-entities` errors on straight quotes inside Russian JSX text, which fails `next build` on Vercel | rewritten with «ёлочки», which is also what the rest of the copy uses |
| Mobile viewport | no `viewport` export in the root layout, so a phone laid the page out at 980px and the hero headline ran off screen | `width=device-width, initial-scale=1`; headline wraps at 390px |
| Horizontal overflow | reveal animations start at `x: ±30/±50` and `ContactUs` had no clipping wrapper, so `scrollWidth` was 404 at a 390 viewport and every centered block sat off axis | section-level `overflow-hidden` plus `overflow-x: clip` on `body` (not `hidden`, which would have broken the sticky rails). Measured `clientWidth == scrollWidth == 390` on all seven routes |
| Product card | `aspectRatio: 3/4` on the card box silently cut the last lines of a long Russian name and the price row under it; price-list cards printed the hardcoded fallback `от 1 500 ₽` next to their own `Цена: 980 ₽` | height follows content, name clamped to two lines, footer price falls back to the price-list entry |
| `/about` and `/contacts` | a plain text card duplicating the landing copy, and a contact form with no `onSubmit` that reloaded the page with query parameters | both routes render the designed sections from the landing (`AboutUs`, `ContactUs`), whose form hands off to WhatsApp |
| Debug output | 12 `console.log` calls shipped in the product page and admin editors | removed |
| Standalone demo | the frontend needed the Nest API and Postgres to show anything | `NEXT_PUBLIC_DEMO=1` swaps in an axios adapter over `src/lib/demo-data.ts`; product art moved from `/uploads/...` on the API host to `public/images/`, so no external asset is required |

## Run it

With Docker (PostgreSQL and MinIO):

```bash
npm run install:all
cp backend/.env.example backend/.env      # set DB_PASSWORD and JWT_SECRET
docker compose up -d postgres minio
psql "$DB_URL" -f backend/migrations/001-initial-schema.sql
psql "$DB_URL" -f backend/migrations/002-add-filters.sql
psql "$DB_URL" -f backend/migrations/003-add-featured-products.sql
npm run dev
```

`npm run dev` checks Docker, waits for the database, creates it if missing and starts both apps. Frontend on http://localhost:3000, API on http://localhost:3001, Swagger on http://localhost:3001/api.

Without Docker, point `DB_HOST` and friends at a local PostgreSQL and run `npm run build && npm run start:prod` in `backend`, `npm run dev` in `frontend`. Uploads need MinIO or an S3-compatible endpoint; everything else runs without it.

Seed demo products: `npm run seed:products` in `backend`. Create or reset the admin login: `npm run update:admin`.

Only the storefront, without the API and the database:

```bash
cd frontend
NEXT_PUBLIC_DEMO=1 npm run dev
```

## Known limits

- The deployed site still completes orders through the WhatsApp deep link in the cart; the API order flow fixed here is not yet released to production.
- The cart lives in `localStorage`, so it is per browser and not shared between devices.
- The admin token is kept in `localStorage` and attached by an axios interceptor, which is readable from any XSS on the admin page.
- No payment provider, no stock reservation, no email notification on new orders.
- The local development database contains two tables, `works` and `site_content`, that no entity or migration references; they are leftovers from an abandoned iteration and are not part of this schema.
- The admin panel is not part of the demo: it logs in against the real API with `fetch`, which the demo adapter does not cover. Run `npm run dev` in `backend` to use it.
- `npm run seed:products` writes placeholder rows named `тест 1…12`; the demo dataset in `frontend/src/lib/demo-data.ts` is a separate, written-for-the-demo catalog. Neither is the client's real price list.
- Product data, client logos and contact details on the production site belong to the business.

## Коротко по-русски

Каталог светодиодного освещения для владивостокского поставщика: Next.js 14, NestJS 11, PostgreSQL, MinIO, всё в docker-compose. Фильтры собираются по загруженному прайс-листу, товары читаются сырым SQL с позиционными параметрами и отдельным джойном цен, админские методы под JWT. В этом запуске я поднял проект локально и нашёл два живых дефекта: `npm run start:prod` падал, потому что `nest build` захватывал `backend/scripts` и клал результат в `dist/src/main.js`, а форма оформления заказа вообще не отправляла данные, хотя эндпоинт, таблица и админский список заказов были готовы и пустовали. Оба починены и проверены в браузере до строки в базе. Внутренние служебные документы и переписку с клиентом из корня убрал, переменные окружения вынесены в `.env.example`. На проде заказ по-прежнему уходит в WhatsApp, API-путь пока не выложен.

Второй заход был про то, чтобы фронтенд вообще собирался и открывался без бэкенда. `next build` по этому коду никто не запускал: он падал на типах (в трёх компонентах лежали три разных описания `Product`, а карточка читала `barcode`, которого в её же типе не было), потом на пререндере `/catalog` без границы `Suspense`, потом на ESLint. Дальше нашлось то, что видно только в браузере: у макета не было `viewport`-мета, поэтому телефон разворачивал 980px и обрезал заголовок; reveal-анимации сдвигали блоки по горизонтали на 30-50px и давали `scrollWidth` 404 при вьюпорте 390, из-за чего отцентрованные секции уезжали; карточка товара с жёстким `aspectRatio: 3/4` молча резала название и строку цены, а товары из прайса показывали поддельное «от 1 500 ₽» рядом с настоящей ценой 980 ₽. Страницы `/about` и `/contacts` были текстовыми заглушками, причём форма на контактах не имела обработчика и перезагружала страницу с query-параметрами. Всё это починено и замерено, а чтобы витрину можно было смотреть вообще без Nest и Postgres, добавлен режим `NEXT_PUBLIC_DEMO=1`: axios-адаптер отвечает из `src/lib/demo-data.ts`, картинки лежат в `public/images`. На этом собран демо-стенд по ссылке выше; товары там вымышленные.

## Rights

© 2026 Nikita Koreshkov. Portfolio piece, all rights reserved. The LEDVL name, product data, client logos and contacts belong to the business.
