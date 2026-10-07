'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import AdminFilters from '@/components/AdminFilters'
import ProductForm from '@/components/ProductForm'

export default function AdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ products: 0, orders: 0 })
  const [activeTab, setActiveTab] = useState<'products' | 'filters'>('products')
  const [products, setProducts] = useState<any[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (token) {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadStats()
      if (activeTab === 'products') {
        loadProducts()
      }
    }
  }, [isAuthenticated, activeTab])

  const loadStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/api/v1/products?per_page=1'),
        api.get('/api/v1/orders'),
      ])
      setStats({
        products: productsRes.data.meta?.total || 0,
        orders: Array.isArray(ordersRes.data) ? ordersRes.data.length : 0,
      })
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('admin_token', data.access_token)
        setIsAuthenticated(true)
        setError('')
      } else {
        setError('Неверный email или пароль')
      }
    } catch (err) {
      setError('Ошибка подключения к серверу')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    setIsAuthenticated(false)
  }

  const loadProducts = async () => {
    try {
      const response = await api.get('/api/v1/products?per_page=100')
      setProducts(response.data.data || [])
    } catch (error) {
      console.error('Failed to load products:', error)
    }
  }

  const handleCreateProduct = async (productData: any) => {
    try {
      await api.post('/api/v1/products', productData)
      await loadProducts()
      await loadStats()
      setShowProductForm(false)
    } catch (error: any) {
      console.error('Failed to create product:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      }
    }
  }

  const handleEditProduct = (product: any) => {
    setEditingProduct(product)
    setShowProductForm(true)
  }

  const handleUpdateProduct = async (productData: any) => {
    if (!editingProduct?.id) return
    try {
      await api.put(`/api/v1/products/${editingProduct.id}`, productData)
      await loadProducts()
      await loadStats()
      setShowProductForm(false)
      setEditingProduct(null)
    } catch (error: any) {
      console.error('Failed to update product:', error)
      if (error.response?.data?.message) {
        alert(error.response.data.message)
      }
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Удалить товар?')) return
    try {
      await api.delete(`/api/v1/products/${id}`)
      await loadProducts()
      await loadStats()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-20 min-h-screen bg-background-main flex items-center justify-center">
        <div className="max-w-md w-full card p-8">
          <h1 className="font-serif text-3xl font-bold mb-6 text-center">Админ-панель</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div>
              <label className="block font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block font-semibold mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full">
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-20 min-h-screen bg-background-main">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-serif text-4xl font-bold">Админ-панель</h1>
          <button onClick={handleLogout} className="btn-secondary">
            Выйти
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card p-6">
            <h2 className="font-semibold mb-2">Товары</h2>
            <p className="text-3xl font-bold text-accent-soft">{stats.products}</p>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold mb-2">Заказы</h2>
            <p className="text-3xl font-bold text-accent-soft">{stats.orders}</p>
          </div>
        </div>
        <div className="mb-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'products'
                  ? 'border-b-2 border-text-primary text-text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Товары
            </button>
            <button
              onClick={() => setActiveTab('filters')}
              className={`px-4 py-2 font-semibold ${
                activeTab === 'filters'
                  ? 'border-b-2 border-text-primary text-text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Фильтры
            </button>
          </div>
        </div>

        {activeTab === 'filters' ? (
          <div className="card p-6">
            <AdminFilters />
          </div>
        ) : (
          <div className="card p-6">
            <h2 className="font-serif text-2xl font-bold mb-4">Управление товарами</h2>
            <div className="space-y-4">
              {showProductForm ? (
                <ProductForm
                  product={editingProduct}
                  onSave={editingProduct ? handleUpdateProduct : handleCreateProduct}
                  onCancel={() => {
                    setShowProductForm(false)
                    setEditingProduct(null)
                  }}
                />
              ) : (
                <>
                  <button 
                    className="btn-primary"
                    onClick={() => {
                      setEditingProduct(null)
                      setShowProductForm(true)
                    }}
                  >
                    Добавить товар
                  </button>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Название</th>
                          <th className="text-left py-3 px-4">Артикул</th>
                          <th className="text-left py-3 px-4">Цена</th>
                          <th className="text-left py-3 px-4">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-text-muted">
                              Товары отсутствуют
                            </td>
                          </tr>
                        ) : (
                          products.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="py-3 px-4">{product.name}</td>
                              <td className="py-3 px-4">{product.article || '-'}</td>
                              <td className="py-3 px-4">{product.base_price} ₽</td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleEditProduct(product)}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                  >
                                    Редактировать
                                  </button>
                                  <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    className="text-sm text-red-600 hover:text-red-800"
                                  >
                                    Удалить
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

