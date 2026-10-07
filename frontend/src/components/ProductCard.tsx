'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

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

interface ProductCardProps {
  id?: string
  name?: string
  price?: number
  image?: string
  product?: Product
}

export default function ProductCard({ id, name, price, image, product }: ProductCardProps) {
  const getCategoryType = () => {
    if (!product?.category?.name) return null
    if (product.category.name.includes('Новый год 2026')) return 'new_year'
    if (product.category.name.includes('Солнечные светильники') || product.category.name.includes('LedVL солнечные')) return 'solar'
    if (product.category.name.includes('Прайс LedVL')) return 'price_list'
    return null
  }

  const categoryType = getCategoryType()
  const displayName = product?.name || name || 'Товар'
  const displayPrice = product?.base_price || price || 0
  const displayImage = product?.images?.[0]?.url || image
  const displayArticle = product?.article || id || 'N/A'

  return (
    <motion.div
      className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100/50 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-500 group relative flex flex-col w-full"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{ aspectRatio: '3/4' }}
    >
      <Link href={`/products/${product?.id || id || '1'}`} className="flex flex-col h-full w-full">
        <div className="relative w-full bg-gray-100 overflow-hidden flex-shrink-0" style={{ aspectRatio: '16/9' }}>
          {displayImage ? (
            <Image
              src={displayImage}
              alt={displayName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200/50 to-gray-300/50">
              <span className="text-text-muted font-montserrat font-extralight">Изображение</span>
            </div>
          )}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {product && !product.is_available && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              Нет в наличии
            </div>
          )}
        </div>
        <div className="p-8 flex flex-col flex-grow">
          <h3 className="font-serif text-2xl font-bold mb-3 text-text-primary">
            {displayName}
          </h3>
          
          {/* Артикул - всегда показываем */}
          <p className="text-text-muted mb-4 font-montserrat font-extralight text-sm">
            Артикул: {displayArticle}
          </p>

          {/* Поля в зависимости от категории */}
          <div className="space-y-2 mb-4 flex-grow">
            {/* Категория "Новый год 2026" */}
            {categoryType === 'new_year' && (
              <>
                {product?.color && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Цвет:</span> {product.color}
                  </p>
                )}
                {product?.wholesale_price && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Оптовая цена:</span> {Number(product.wholesale_price).toLocaleString('ru-RU')} ₽
                  </p>
                )}
                {product?.specs?.technical && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Характеристики:</span> {String(product.specs.technical).substring(0, 50)}
                    {String(product.specs.technical).length > 50 ? '...' : ''}
                  </p>
                )}
                {product?.is_available !== undefined && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Наличие:</span> {product.is_available && product.stock_count > 0 ? `В наличии (${product.stock_count} шт.)` : 'Нет в наличии'}
                  </p>
                )}
              </>
            )}

            {/* Категория "Солнечные светильники" */}
            {categoryType === 'solar' && (
              <>
                {product?.vendor_model && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Модель:</span> {product.vendor_model}
                  </p>
                )}
                {product?.specs?.power && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Мощность:</span> {product.specs.power}
                  </p>
                )}
                {product?.specs?.led_count && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Количество LED:</span> {product.specs.led_count}
                  </p>
                )}
                {product?.dims && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Размер:</span> {product.dims.width || ''}x{product.dims.height || ''}
                    {product.dims.length ? `x${product.dims.length}` : ''} мм
                  </p>
                )}
                {product?.specs?.panel_size && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Солнечная панель:</span> {product.specs.panel_size}
                  </p>
                )}
                {product?.specs?.battery && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Аккумулятор:</span> {product.specs.battery}
                  </p>
                )}
                {product?.specs?.mode && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Режим работы:</span> {product.specs.mode}
                  </p>
                )}
                {product?.specs?.area && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Площадь освещения:</span> {product.specs.area} м²
                  </p>
                )}
                {product?.specs?.params && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Параметры:</span> {String(product.specs.params).substring(0, 50)}
                    {String(product.specs.params).length > 50 ? '...' : ''}
                  </p>
                )}
                {product?.price_list_entries && product.price_list_entries.length > 0 && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Цена из прайса:</span> {Number(product.price_list_entries[0].price).toLocaleString('ru-RU')} ₽
                  </p>
                )}
              </>
            )}

            {/* Категория "Прайс LedVL" */}
            {categoryType === 'price_list' && (
              <>
                {product?.barcode && (
                  <p className="text-text-muted text-sm">
                    <span className="font-semibold">Штрихкод:</span> {product.barcode}
                  </p>
                )}
                {product?.price_list_entries && product.price_list_entries.length > 0 && (
                  <>
                    {product.price_list_entries[0].stock_pack_qty && (
                      <p className="text-text-muted text-sm">
                        <span className="font-semibold">Кол-во в упаковке:</span> {product.price_list_entries[0].stock_pack_qty}
                      </p>
                    )}
                    {product.price_list_entries[0].boxes_qty && (
                      <p className="text-text-muted text-sm">
                        <span className="font-semibold">Кол-во в ящике:</span> {product.price_list_entries[0].boxes_qty}
                      </p>
                    )}
                    <p className="text-text-muted text-sm">
                      <span className="font-semibold">Цена:</span> {Number(product.price_list_entries[0].price).toLocaleString('ru-RU')} ₽
                    </p>
                  </>
                )}
              </>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 mt-auto">
            <span className="text-3xl font-bold text-text-primary font-serif">
              {displayPrice ? `${Number(displayPrice).toLocaleString('ru-RU')} ₽` : 'от 1 500 ₽'}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
