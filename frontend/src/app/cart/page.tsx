'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCart } from '@/store/cart'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const total = getTotal()

  const handleCheckout = () => {
    if (items.length === 0) return

    let message = `Здравствуйте! Хочу оформить заказ:\n\n`
    
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name || 'Товар'}\n`
      if (item.price) {
        message += `   Цена: ${Number(item.price).toLocaleString('ru-RU')} ₽\n`
      }
      message += `   Количество: ${item.quantity}\n`
      message += `   Сумма: ${Number(item.price * item.quantity).toLocaleString('ru-RU')} ₽\n\n`
    })
    
    message += `💰 Итого: ${total.toLocaleString('ru-RU')} ₽\n\n`
    message += `Ссылка на корзину: ${typeof window !== 'undefined' ? window.location.href : ''}`

    // Номер телефона можно вынести в переменные окружения
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '79999999999'
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-12">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary">Корзина</h1>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-text-muted hover:text-text-primary transition-colors font-montserrat text-sm self-start sm:self-auto"
              >
                Очистить корзину
              </button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-gray-100/50 text-center"
              >
                <div className="mb-6">
                  <svg className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-4 text-text-primary">Ваша корзина пуста</h2>
                <p className="text-text-muted mb-8 font-montserrat">Добавьте товары из каталога</p>
                <Link
                  href="/catalog"
                  className="inline-block bg-black hover:bg-gray-800 text-white rounded-xl font-semibold px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Перейти в каталог
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-100/50 hover:shadow-2xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Изображение товара */}
                      {item.image && (
                        <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name || 'Товар'}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 128px"
                          />
                        </div>
                      )}
                      
                      {/* Информация о товаре */}
                      <div className="flex-grow flex flex-col justify-between gap-4">
                        <div>
                          <h3 className="font-serif text-xl sm:text-2xl font-bold mb-2 text-text-primary">
                            {item.name || 'Товар'}
                          </h3>
                          <p className="text-text-muted font-montserrat mb-4 text-sm sm:text-base">
                            {item.price.toLocaleString('ru-RU')} ₽ за шт.
                          </p>
                        </div>

                        {/* Управление количеством и удаление */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-text-primary transition-all duration-300 font-bold text-base sm:text-lg"
                            >
                              −
                            </button>
                            <span className="w-12 sm:w-16 text-center font-semibold text-base sm:text-lg">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-300 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-text-primary transition-all duration-300 font-bold text-base sm:text-lg"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="text-xl sm:text-2xl font-bold text-text-primary font-serif">
                                {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product_id)}
                              className="text-red-500 hover:text-red-700 transition-colors p-2"
                              title="Удалить"
                            >
                              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Боковая панель с итогами */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:sticky lg:top-24"
            >
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100/50">
                <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-6 text-text-primary">Итого</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-text-muted font-montserrat text-sm sm:text-base">Товары ({items.length})</span>
                    <span className="font-semibold text-text-primary text-sm sm:text-base">{total.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-text-muted font-montserrat text-sm sm:text-base">Доставка</span>
                    <span className="font-semibold text-text-primary text-sm sm:text-base">—</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xl sm:text-2xl font-bold text-text-primary font-serif">Всего</span>
                    <span className="text-2xl sm:text-3xl font-bold text-text-primary font-serif">
                      {total.toLocaleString('ru-RU')} ₽
                    </span>
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="space-y-3">
                    <button
                      onClick={handleCheckout}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold py-3 sm:py-4 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg"
                    >
                      <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Оформить заказ
                    </button>
                    <Link
                      href="/catalog"
                      className="w-full border-2 border-gray-300 hover:border-text-primary text-text-primary rounded-xl font-semibold py-3 sm:py-4 transition-all duration-300 block text-center text-base sm:text-lg"
                    >
                      Продолжить покупки
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
