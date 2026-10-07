'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import ProductCard from './ProductCard'
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

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const response = await api.get('/api/v1/products/featured')
      setProducts(response.data || [])
    } catch (error) {
      console.error('Failed to load featured products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="py-32 bg-background-dark text-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <p className="text-gray-400">Загрузка...</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) {
    return null
  }

  return (
    <section className="py-32 bg-background-dark text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)'
        }} />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white">
            Популярные товары
          </h2>
          <p className="text-gray-400 text-lg md:text-xl font-montserrat font-extralight max-w-2xl mx-auto">
            Выберите идеальное освещение для вашего пространства
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            href="/catalog"
            className="px-10 py-5 font-montserrat text-base font-extralight bg-white text-text-primary rounded-lg hover:bg-white/95 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 inline-block"
          >
            Смотреть весь каталог
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
