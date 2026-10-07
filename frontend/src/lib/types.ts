/**
 * Контракт товара из GET /api/v1/products. Держится в одном месте: карточка,
 * подборка и страница товара раньше описывали его по-разному, из-за чего
 * поля вроде barcode терялись на уровне типов.
 */

export interface ProductImage {
  url: string
  width?: number
  height?: number
  size?: string
}

export interface ProductSpecs {
  technical?: string
  power?: string
  led_count?: string
  panel_size?: string
  battery?: string
  mode?: string
  area?: string
  params?: string
  warranty?: string
  [key: string]: string | undefined
}

export interface ProductDims {
  width?: number
  height?: number
  length?: number
}

export interface PriceListEntry {
  id?: string
  stock_pack_qty: number | null
  boxes_qty: number | null
  price: number
}

export interface ProductFilterValue {
  id: string
  value: string
  display_name: string | null
  filter: {
    id: string
    name: string
  }
}

export interface Product {
  id: string
  name: string
  article: string | null
  barcode: string | null
  base_price: number
  wholesale_price: number | null
  color: string | null
  is_available: boolean
  is_featured?: boolean
  stock_count: number
  vendor_model: string | null
  description?: string | null
  specs: ProductSpecs | null
  dims: ProductDims | null
  images: ProductImage[] | null
  category: {
    id: string
    name: string
  } | null
  price_list_entries?: PriceListEntry[] | null
  filter_values?: ProductFilterValue[]
  created_at?: string
  updated_at?: string
}

export interface ProductsPage {
  data: Product[]
  meta: {
    total: number
    page: number
    per_page: number
    total_pages: number
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
  parent: Category | null
  children: Category[]
}
