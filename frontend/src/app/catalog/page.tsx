'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import CatalogFilters from '@/components/CatalogFilters'
import ProductCard from '@/components/ProductCard'
import { motion, AnimatePresence } from 'framer-motion'
import api from '@/lib/api'

interface Product {
  id: string
  name: string
  article: string | null
  base_price: number
  wholesale_price: number | null
  color: string | null
  is_available: boolean
  stock_count: number
  vendor_model: string | null
  specs: Record<string, any> | null
  dims: Record<string, any> | null
  images: Array<{ url: string }> | null
  category: {
    id: string
    name: string
  } | null
  price_list_entries?: Array<{
    stock_pack_qty: number | null
    boxes_qty: number | null
    price: number
  }>
}

interface Category {
  id: string
  name: string
  slug: string
}

export default function CatalogPage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  
  const [filtersVisible, setFiltersVisible] = useState(true)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    if (categoryParam) {
      const category = categories.find(c => c.id === categoryParam || c.slug === categoryParam)
      if (category) {
        setSelectedCategory(category)
      }
    }
  }, [categoryParam, categories])

  useEffect(() => {
    loadProducts()
  }, [selectedCategory, filters, sort, page, searchQuery])

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/v1/categories')
      setCategories(response.data)
      
      if (categoryParam) {
        const category = response.data.find((c: Category) => c.id === categoryParam || c.slug === categoryParam)
        if (category) {
          setSelectedCategory(category)
        }
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params: any = {
        page,
        per_page: 12,
        sort,
      }

      if (selectedCategory) {
        params.category = selectedCategory.id
      }

      if (searchQuery && searchQuery.trim()) {
        params.q = searchQuery.trim()
      }

      if (Object.keys(filters).length > 0) {
        params.filters = JSON.stringify(filters)
      }

      const response = await api.get('/api/v1/products', { params })
      setProducts(response.data.data || [])
      setProductsCount(response.data.meta?.total || 0)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }, [selectedCategory, filters, sort, page])

  const handleSort = (sortType: string) => {
    setSort(sortType)
    setSortOpen(false)
    setPage(1)
  }

  const handleFiltersChange = (newFilters: Record<string, any>) => {
    setFilters(newFilters)
    setPage(1)
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="mb-8">
        <div className="border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-6">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold text-text-primary">
                  Каталог товаров <span className="text-text-muted font-normal text-2xl md:text-3xl">({productsCount})</span>
                </h1>
                {selectedCategory && (
                  <p className="text-text-muted mt-2">Категория: {selectedCategory.name}</p>
                )}
              </div>
              {/* Кнопки для десктопа */}
              <div className="hidden lg:flex flex-wrap gap-4 items-center justify-end">
                <button
                  onClick={() => setFiltersVisible(!filtersVisible)}
                  className="text-text-primary hover:text-text-primary/80 transition-colors font-montserrat px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  {filtersVisible ? 'Скрыть фильтры' : 'Показать фильтры'}
                </button>
                <div className="relative">
                  <button
                    onClick={() => setSortOpen(!sortOpen)}
                    className="text-text-primary hover:text-text-primary/80 transition-colors font-montserrat px-4 py-2 rounded-lg hover:bg-gray-50"
                  >
                    Сортировать
                  </button>
                  {sortOpen && (
                    <motion.div
                      className="absolute top-full right-0 mt-2 bg-white rounded-lg p-2 z-10 min-w-[200px] border border-gray-100 shadow-lg"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => handleSort('default')}
                      >
                        По умолчанию
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => handleSort('price_asc')}
                      >
                        По цене (возр.)
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => handleSort('price_desc')}
                      >
                        По цене (убыв.)
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => handleSort('popularity')}
                      >
                        По популярности
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => handleSort('date')}
                      >
                        По дате добавления
                      </button>
                      <button 
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => handleSort('stock')}
                      >
                        По наличию
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky панель с кнопками для мобильных и планшетов */}
      <div className="lg:hidden sticky top-20 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-4 items-center py-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex-1 text-text-primary hover:text-text-primary/80 transition-colors font-montserrat px-4 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-200 flex items-center justify-center gap-2 bg-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Фильтры
            </button>
            <div className="relative flex-1">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="w-full text-text-primary hover:text-text-primary/80 transition-colors font-montserrat px-4 py-2.5 rounded-lg hover:bg-gray-50 border border-gray-200 bg-white flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Сортировать
              </button>
              {sortOpen && (
                <motion.div
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg p-2 z-40 border border-gray-100 shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleSort('default')}
                  >
                    По умолчанию
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleSort('price_asc')}
                  >
                    По цене (возр.)
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleSort('price_desc')}
                  >
                    По цене (убыв.)
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleSort('popularity')}
                  >
                    По популярности
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    По дате добавления
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleSort('stock')}
                  >
                    По наличию
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Фильтры для десктопа */}
          {filtersVisible && (
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <CatalogFilters
                  categoryId={selectedCategory?.id}
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  searchQuery={searchQuery}
                  onSearchChange={(query) => {
                    setSearchQuery(query)
                    setPage(1)
                  }}
                />
              </div>
            </aside>
          )}

          {/* Выпадающая панель фильтров для мобильных и планшетов */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <>
                {/* Затемненный фон */}
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => setMobileFiltersOpen(false)}
                />
                
                {/* Панель фильтров */}
                <motion.aside
                  className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 lg:hidden shadow-2xl overflow-y-auto"
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="font-serif text-2xl font-bold text-text-primary">Фильтры</h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 text-text-primary hover:text-gray-600 transition-colors"
                      aria-label="Закрыть фильтры"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-6">
                    <CatalogFilters
                      categoryId={selectedCategory?.id}
                      filters={filters}
                      onFiltersChange={(newFilters) => {
                        handleFiltersChange(newFilters)
                        // Можно автоматически закрывать панель после применения фильтров, или оставить открытой
                      }}
                      searchQuery={searchQuery}
                      onSearchChange={(query) => {
                        setSearchQuery(query)
                        setPage(1)
                      }}
                    />
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div className={`flex-1 ${loading ? 'flex items-center justify-center min-h-[400px]' : ''}`}>
            {loading ? (
              <p className="text-text-muted">Загрузка товаров...</p>
            ) : products.length === 0 ? (
              <p className="text-text-muted text-center py-12">Товары не найдены</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.base_price}
                    image={product.images?.[0]?.url}
                    product={product}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
