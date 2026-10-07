'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import api from '@/lib/api'
import { useCart } from '@/store/cart'
import type { Product } from '@/lib/types'

export default function ProductPage() {
  const params = useParams()
  const productId = params?.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('description')
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [addedToCart, setAddedToCart] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    if (productId) {
      loadProduct()
    }
  }, [productId])

  const loadProduct = async () => {
    try {
      const response = await api.get(`/api/v1/products/${productId}`)
      setProduct(response.data)
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      product_id: product.id,
      name: product.name,
      price: product.base_price,
      quantity: quantity,
      image: product.images?.[0]?.url || null,
    })

    setAddedToCart(true)
    setShowNotification(true)
    

    setTimeout(() => {
      setAddedToCart(false)
    }, 3000)
    

    setTimeout(() => {
      setShowNotification(false)
    }, 4000)
  }

  const handleOrder = () => {
    if (!product) return
    
    const message = `Здравствуйте! Хочу заказать товар:

📦 ${product.name}
${product.article ? `Артикул: ${product.article}` : ''}
💰 Цена: ${Number(product.base_price).toLocaleString('ru-RU')} ₽
🔢 Количество: ${quantity}
${product.wholesale_price ? `💼 Оптовая цена: ${Number(product.wholesale_price).toLocaleString('ru-RU')} ₽` : ''}

Ссылка на товар: ${typeof window !== 'undefined' ? window.location.href : ''}`

    // Номер телефона можно вынести в переменные окружения
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '79999999999'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank')
    }
  }

  const tabs = [
    { id: 'description', label: 'Описание' },
    { id: 'specs', label: 'Технические характеристики' },
    { id: 'warranty', label: 'Гарантия' },
  ]

  if (loading) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-text-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Загрузка товара...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-background-main flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-4xl font-bold mb-4">Товар не найден</h1>
          <p className="text-text-muted">Запрашиваемый товар не существует или был удален.</p>
        </div>
      </div>
    )
  }

  const images = product.images || []
  const mainImage = images[selectedImageIndex] || images[0]
  const displayPrice = product.base_price * quantity
  const displayPricePerUnit = product.base_price
  const hasWholesalePrice = product.wholesale_price && product.wholesale_price < product.base_price

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main relative">
      {/* Уведомление о добавлении в корзину */}
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3"
        >
          <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">Товар добавлен в корзину!</span>
        </motion.div>
      )}
      
      <div className="container mx-auto px-4">
        {/* Хлебные крошки */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-text-muted">
            <li>
              <Link href="/" className="hover:text-text-primary transition-colors">
                Главная
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li>
              <Link href="/catalog" className="hover:text-text-primary transition-colors">
                Каталог
              </Link>
            </li>
            <li>
              <span className="mx-2">/</span>
            </li>
            <li className="text-text-primary font-semibold" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Галерея изображений */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="relative h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl overflow-hidden shadow-2xl border border-gray-100/50 group">
              {mainImage?.url ? (
                <Image
                  src={mainImage.url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-text-muted font-montserrat font-extralight text-lg">Изображение отсутствует</span>
                </div>
              )}
              {!product.is_available && (
                <div className="absolute top-6 left-6 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Нет в наличии
                </div>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.slice(0, 4).map((image, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImageIndex === index
                        ? 'border-text-primary shadow-lg scale-105'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} - изображение ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 12.5vw"
                      unoptimized
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Информация о товаре */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            <div>
              <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4 text-text-primary leading-tight">
                {product.name}
              </h1>
              {product.article && (
                <p className="text-text-muted text-lg font-montserrat font-extralight mb-2">
                  Артикул: <span className="font-semibold">{product.article}</span>
                </p>
              )}
            </div>
            
            {/* Цены */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-5xl font-bold text-text-primary font-serif">
                  {Number(displayPrice).toLocaleString('ru-RU')} ₽
                </span>
                {quantity > 1 && (
                  <span className="text-lg text-text-muted font-montserrat">
                    ({Number(displayPricePerUnit).toLocaleString('ru-RU')} ₽ × {quantity})
                  </span>
                )}
              </div>
              {hasWholesalePrice && (
                <p className="text-sm text-text-muted font-montserrat">
                  Оптовая цена: <span className="font-semibold text-text-primary">
                    {Number(product.wholesale_price).toLocaleString('ru-RU')} ₽
                  </span>
                </p>
              )}
            </div>

            {/* Количество */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100/50 shadow-sm">
              <label className="block font-semibold mb-4 text-text-primary">Количество</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-text-primary transition-all duration-300 font-bold text-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-24 text-center border-2 border-gray-300 rounded-xl py-3 text-lg font-semibold focus:outline-none focus:border-text-primary transition-colors"
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-text-primary transition-all duration-300 font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_available || addedToCart}
                className={`w-full rounded-xl font-semibold py-4 transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed text-lg ${
                  addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-black hover:bg-gray-800 text-white disabled:opacity-50'
                }`}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Добавлено в корзину!
                  </span>
                ) : (
                  'Добавить в корзину'
                )}
              </button>
              <button
                onClick={handleOrder}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold py-4 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Заказать
              </button>
            </div>

            {/* Краткие характеристики */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100/50 shadow-lg">
              <h3 className="font-serif text-2xl font-bold mb-4 text-text-primary">Краткие характеристики</h3>
              <ul className="space-y-3">
                {product.vendor_model && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-text-muted font-montserrat">Модель:</span>
                    <span className="font-semibold text-text-primary">{product.vendor_model}</span>
                  </li>
                )}
                {product.color && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-text-muted font-montserrat">Цвет:</span>
                    <span className="font-semibold text-text-primary">{product.color}</span>
                  </li>
                )}
                {product.dims && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-text-muted font-montserrat">Размер:</span>
                    <span className="font-semibold text-text-primary">
                      {product.dims.width || ''}x{product.dims.height || ''}
                      {product.dims.length ? `x${product.dims.length}` : ''} мм
                    </span>
                  </li>
                )}
                {product.specs?.power && (
                  <li className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-text-muted font-montserrat">Мощность:</span>
                    <span className="font-semibold text-text-primary">{product.specs.power}</span>
                  </li>
                )}
                {product.is_available !== undefined && (
                  <li className="flex justify-between items-center py-2">
                    <span className="text-text-muted font-montserrat">Наличие:</span>
                    <span className={`font-semibold ${product.is_available && product.stock_count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.is_available && product.stock_count > 0 
                        ? `В наличии (${product.stock_count} шт.)` 
                        : 'Нет в наличии'}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Вкладки с описанием */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="border-b-2 border-gray-200 mb-8">
            <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-4 px-2 font-semibold text-lg transition-all duration-300 whitespace-nowrap text-left md:text-center ${
                    activeTab === tab.id
                      ? 'text-text-primary border-b-4 border-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100/50">
            {activeTab === 'description' && (
              <div>
                {product.description ? (
                  <p className="text-text-primary leading-relaxed text-lg font-montserrat">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-text-muted leading-relaxed text-lg font-montserrat">
                    Описание товара отсутствует.
                  </p>
                )}
              </div>
            )}
            {activeTab === 'specs' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-4 px-6 font-serif text-xl font-bold text-text-primary">Параметр</th>
                      <th className="text-left py-4 px-6 font-serif text-xl font-bold text-text-primary">Значение</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.specs && Object.entries(product.specs)
                      .filter(([key]) => key !== 'warranty') // Исключаем гарантию, она в отдельной вкладке
                      .map(([key, value]) => (
                        <tr key={key} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-6 font-semibold text-text-primary capitalize">{key.replace(/_/g, ' ')}</td>
                          <td className="py-4 px-6 text-text-muted">{String(value)}</td>
                        </tr>
                      ))}
                    {product.dims && (
                      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 font-semibold text-text-primary">Размеры</td>
                        <td className="py-4 px-6 text-text-muted">
                          {product.dims.width || ''}x{product.dims.height || ''}
                          {product.dims.length ? `x${product.dims.length}` : ''} мм
                        </td>
                      </tr>
                    )}
                    {(!product.specs || Object.keys(product.specs).length === 0) && !product.dims && (
                      <tr>
                        <td colSpan={2} className="py-8 text-center text-text-muted">
                          Технические характеристики отсутствуют
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === 'warranty' && (
              <div>
                {product.specs?.warranty ? (
                  <div className="prose max-w-none">
                    <p className="text-text-primary leading-relaxed text-lg font-montserrat whitespace-pre-line">
                      {product.specs.warranty}
                    </p>
                  </div>
                ) : (
                  <p className="text-text-muted text-lg font-montserrat">
                    Информация о гарантии отсутствует.
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
