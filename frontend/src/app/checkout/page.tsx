'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import { useCart } from '@/store/cart'

type CheckoutForm = {
  name: string
  phone: string
  email?: string
  address?: string
  comment?: string
}

export default function CheckoutPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>()
  const items = useCart((state) => state.items)
  const clearCart = useCart((state) => state.clearCart)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (data: CheckoutForm) => {
    if (items.length === 0) {
      setError('Корзина пуста, добавьте товары перед оформлением')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const response = await api.post('/api/v1/orders', {
        items: items.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        customer_info: data,
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      })
      setOrderId(response.data.id)
      clearCart()
    } catch (e) {
      setError('Не удалось отправить заказ, попробуйте позже или свяжитесь по телефону')
    } finally {
      setSubmitting(false)
    }
  }

  if (orderId) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-background-main">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6">Заказ принят</h1>
          <p className="mb-2">Номер заказа: <span className="font-mono">{orderId}</span></p>
          <p>Мы свяжемся с вами по указанному телефону.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="container mx-auto px-4">
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-8">Оформление заказа</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
          <div className="card p-8 space-y-6 mb-8">
            <h2 className="font-serif text-2xl font-bold">Контактная информация</h2>
            <div>
              <label className="block font-semibold mb-2">Имя *</label>
              <input
                {...register('name', { required: 'Укажите имя' })}
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block font-semibold mb-2">Телефон *</label>
              <input
                {...register('phone', {
                  required: 'Укажите телефон',
                  validate: (value) =>
                    value.replace(/\D/g, '').length >= 10 || 'Телефон должен содержать минимум 10 цифр',
                })}
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
              {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Адрес доставки</label>
              <textarea
                {...register('address')}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Комментарий</label>
              <textarea
                {...register('comment')}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                rows={3}
              />
            </div>
          </div>
          <div className="card p-6 mb-8 flex items-center justify-between">
            <div>
              <span className="font-semibold">Товаров в заказе:</span> {items.length}
            </div>
            <div className="font-serif text-2xl font-bold">
              {items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString('ru-RU')} ₽
            </div>
          </div>
          {error && <p className="text-red-400 mb-4">{error}</p>}
          <div className="flex gap-4">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Отправка...' : 'Подтвердить заказ'}
            </button>
            <button type="button" className="btn-secondary">
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

