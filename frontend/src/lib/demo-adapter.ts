import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { categories, filters, products } from './demo-data'

/**
 * Сетевой слой демо-режима: отвечает на контракты Nest-бэкенда из demo-data.ts,
 * не выходя в сеть. Включается только NEXT_PUBLIC_DEMO=1 (см. lib/api.ts).
 */

const priceOf = (product: (typeof products)[number]) =>
  product.base_price || product.price_list_entries?.[0]?.price || 0

function response(config: InternalAxiosRequestConfig, data: unknown, status = 200): AxiosResponse {
  return { config, data, status, statusText: 'OK', headers: {} }
}

function notFound(config: InternalAxiosRequestConfig, message: string) {
  return Promise.reject({
    config,
    isAxiosError: true,
    message,
    response: { config, data: { message }, status: 404, statusText: 'Not Found', headers: {} },
  })
}

interface ProductQuery {
  page?: string | number
  per_page?: string | number
  sort?: string
  category?: string
  q?: string
  filters?: string
}

const SORTS: Record<string, (a: typeof products[number], b: typeof products[number]) => number> = {
  default: (a, b) => a.created_at < b.created_at ? 1 : -1,
  price_asc: (a, b) => priceOf(a) - priceOf(b),
  price_desc: (a, b) => priceOf(b) - priceOf(a),
  popularity: (a, b) => b.stock_count - a.stock_count,
  date: (a, b) => (a.created_at < b.created_at ? 1 : -1),
  stock: (a, b) => Number(b.is_available) - Number(a.is_available),
}

function listProducts(query: ProductQuery) {
  const page = Number(query.page ?? 1) || 1
  const perPage = Number(query.per_page ?? 12) || 12
  const selected = parseFilters(query.filters)

  let items = products.filter((product) => {
    if (query.category && product.category?.id !== query.category) return false
    if (query.q) {
      const haystack = `${product.name} ${product.article} ${product.vendor_model ?? ''}`.toLowerCase()
      if (!haystack.includes(String(query.q).toLowerCase())) return false
    }
    return matchesFilters(product, selected)
  })

  items = [...items].sort(SORTS[query.sort ?? 'default'] ?? SORTS.default)

  return {
    data: items.slice((page - 1) * perPage, page * perPage),
    meta: { total: items.length, page, per_page: perPage, total_pages: Math.max(1, Math.ceil(items.length / perPage)) },
  }
}

function parseFilters(raw: ProductQuery['filters']): Record<string, unknown> {
  if (!raw) return {}
  try {
    return JSON.parse(String(raw)) as Record<string, unknown>
  } catch {
    return {}
  }
}

function matchesFilters(product: (typeof products)[number], selected: Record<string, unknown>) {
  return Object.entries(selected).every(([filterId, value]) => {
    const filter = filters.find((f) => f.id === filterId)
    if (!filter) return true

    if (filter.type === 'range') {
      const range = value as { min?: number; max?: number }
      const price = priceOf(product)
      if (range?.min !== undefined && price < Number(range.min)) return false
      if (range?.max !== undefined && price > Number(range.max)) return false
      return true
    }

    const chosen = Array.isArray(value) ? value : [value]
    const own = product.filter_values.filter((tag) => tag.filter.id === filterId).map((tag) => tag.id)
    return chosen.some((id) => own.includes(String(id)))
  })
}

const demoAdapter: AxiosAdapter = (config) => {
  const path = (config.url ?? '').split('?')[0]
  const query = (config.params ?? {}) as ProductQuery & Record<string, unknown>
  const method = (config.method ?? 'get').toLowerCase()

  if (method === 'get' && path === '/api/v1/products') {
    return Promise.resolve(response(config, listProducts(query)))
  }

  if (method === 'get' && path === '/api/v1/products/featured') {
    return Promise.resolve(response(config, products.filter((p) => p.is_featured && p.is_available).slice(0, 3)))
  }

  if (method === 'get' && path === '/api/v1/categories') {
    return Promise.resolve(response(config, categories))
  }

  if (method === 'get' && path === '/api/v1/filters') {
    const categoryId = query.category as string | undefined
    return Promise.resolve(response(config, categoryId ? filters.filter((f) => !f.category_id || f.category_id === categoryId) : filters))
  }

  if (method === 'get') {
    const productMatch = /^\/api\/v1\/products\/([\w-]+)$/.exec(path)
    if (productMatch) {
      const product = products.find((p) => p.id === productMatch[1] || p.article === productMatch[1])
      return product ? Promise.resolve(response(config, product)) : notFound(config, 'Товар не найден')
    }
    if (path === '/api/v1/orders') {
      return Promise.resolve(response(config, []))
    }
  }

  if (method === 'post' && path === '/api/v1/orders') {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data ?? {}
    return Promise.resolve(
      response(
        config,
        {
          id: `demo-${Date.now().toString(36)}`,
          status: 'pending',
          total: body.total ?? 0,
          created_at: new Date().toISOString(),
        },
        201,
      ),
    )
  }

  return notFound(config, 'Метод недоступен в демо-режиме')
}

export default demoAdapter
