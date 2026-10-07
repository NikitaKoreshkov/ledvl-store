'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface ProductImage {
  url: string
  width?: number
  height?: number
  size?: string
}

interface Product {
  id?: string
  name: string
  article: string | null
  base_price: number
  wholesale_price: number | null
  stock_count: number
  is_available: boolean
  is_featured?: boolean
  description: string | null
  filter_value_ids?: string[]
  specs?: Record<string, any> | null
  images?: ProductImage[] | null
}

interface Filter {
  id: string
  name: string
  type: 'select' | 'checkbox' | 'range' | 'text'
  values: FilterValue[]
}

interface FilterValue {
  id: string
  value: string
  display_name: string | null
}

interface ProductFormProps {
  product?: Product
  onSave: (product: Product) => void
  onCancel: () => void
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [filters, setFilters] = useState<Filter[]>([])
  const [formData, setFormData] = useState<Product>({
    name: product?.name || '',
    article: product?.article || null,
    base_price: product?.base_price || 0,
    wholesale_price: product?.wholesale_price || null,
    stock_count: product?.stock_count || 0,
    is_available: product?.is_available ?? true,
    is_featured: product?.is_featured || false,
    description: product?.description || null,
    filter_value_ids: product?.filter_value_ids || [],
    specs: product?.specs || null,
    images: product?.images || null,
  })
  
  // Состояние для изображений
  const [images, setImages] = useState<ProductImage[]>(product?.images || [])
  const [uploading, setUploading] = useState(false)
  
  // Состояние для редактирования технических характеристик (пары параметр-значение)
  interface SpecItem {
    key: string
    value: string
  }
  const [technicalSpecs, setTechnicalSpecs] = useState<SpecItem[]>(() => {
    if (product?.specs) {
      // Исключаем warranty и technical из списка, так как они обрабатываются отдельно
      const { warranty, technical, ...otherSpecs } = product.specs
      return Object.entries(otherSpecs).map(([key, value]) => ({
        key,
        value: String(value),
      }))
    }
    return []
  })
  // Состояние для редактирования гарантии
  const [warranty, setWarranty] = useState<string>(
    product?.specs?.warranty || ''
  )
  const [featuredError, setFeaturedError] = useState('')

  useEffect(() => {
    loadFilters()
    if (product?.id) {
      loadProductFilters()
    }
  }, [product?.id])

  const loadFilters = async () => {
    try {
      const response = await api.get('/api/v1/filters')
      setFilters(response.data || [])
    } catch (error) {
      console.error('Failed to load filters:', error)
    }
  }

  const loadProductFilters = async () => {
    if (!product?.id) return
    try {
      const response = await api.get(`/api/v1/products/${product.id}`)
      const productData = response.data
      setFormData(prev => ({
        ...prev,
        filter_value_ids: productData.filter_values?.map((fv: FilterValue) => fv.id) || [],
        is_featured: productData.is_featured || false,
        specs: productData.specs || null,
      }))
      // Загружаем технические характеристики как пары параметр-значение
      if (productData.specs) {
        const { warranty, technical, ...otherSpecs } = productData.specs
        setTechnicalSpecs(
          Object.entries(otherSpecs).map(([key, value]) => ({
            key,
            value: String(value),
          }))
        )
      } else {
        setTechnicalSpecs([])
      }
      setWarranty(productData.specs?.warranty || '')
      setImages(productData.images || [])
    } catch (error) {
      console.error('Failed to load product filters:', error)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Преобразуем массив пар параметр-значение в объект
    const specsObject: Record<string, any> = {}
    technicalSpecs.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specsObject[spec.key.trim()] = spec.value.trim()
      }
    })
    // Добавляем гарантию, если она указана
    if (warranty.trim()) {
      specsObject.warranty = warranty.trim()
    }
    
    const productToSave = {
      ...formData,
      specs: Object.keys(specsObject).length > 0 ? specsObject : null,
      images: images.length > 0 ? images : null,
    }
    
    onSave(productToSave)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain: boolean = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      const formData = new FormData()
      Array.from(files).forEach((file) => {
        formData.append('images', file)
      })

      const response = await api.post('/api/v1/upload/images', formData)
      
      if (!response.data || !response.data.files) {
        throw new Error('Invalid response from server')
      }

      const uploadedFiles = response.data.files
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const newImages: ProductImage[] = uploadedFiles.map((file: any) => ({
        url: `${apiUrl}${file.path}`,
      }))


      if (isMain) {
        // Если это основное изображение, добавляем в начало (заменяем существующее основное)
        if (images.length > 0) {
          setImages([...newImages, ...images.slice(1)])
        } else {
          setImages([...newImages, ...images])
        }
      } else {
        // Иначе добавляем в конец
        setImages([...images, ...newImages])
      }
    } catch (error: any) {
      console.error('Failed to upload images:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка при загрузке изображений'
      alert(`Ошибка при загрузке изображений: ${errorMessage}`)
    } finally {
      setUploading(false)
      // Сбрасываем input
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [moved] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, moved)
    setImages(newImages)
  }

  const addSpecItem = () => {
    setTechnicalSpecs([...technicalSpecs, { key: '', value: '' }])
  }

  const removeSpecItem = (index: number) => {
    setTechnicalSpecs(technicalSpecs.filter((_, i) => i !== index))
  }

  const updateSpecItem = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...technicalSpecs]
    updated[index] = { ...updated[index], [field]: value }
    setTechnicalSpecs(updated)
  }

  const toggleFilterValue = (valueId: string) => {
    const current = formData.filter_value_ids || []
    if (current.includes(valueId)) {
      setFormData({
        ...formData,
        filter_value_ids: current.filter(id => id !== valueId),
      })
    } else {
      setFormData({
        ...formData,
        filter_value_ids: [...current, valueId],
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-semibold mb-2">Название товара *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          required
        />
      </div>

      <div>
        <label className="block font-semibold mb-2">Артикул</label>
        <input
          type="text"
          value={formData.article || ''}
          onChange={(e) => setFormData({ ...formData, article: e.target.value || null })}
          className="w-full px-4 py-2 border border-gray-300 rounded"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-2">Базовая цена *</label>
          <input
            type="number"
            step="0.01"
            value={formData.base_price}
            onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Оптовая цена</label>
          <input
            type="number"
            step="0.01"
            value={formData.wholesale_price || ''}
            onChange={(e) => setFormData({ ...formData, wholesale_price: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold mb-2">Количество на складе</label>
          <input
            type="number"
            value={formData.stock_count}
            onChange={(e) => setFormData({ ...formData, stock_count: Number(e.target.value) })}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label className="flex items-center space-x-2 cursor-pointer mt-8">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4"
            />
            <span>В наличии</span>
          </label>
        </div>
      </div>

      <div>
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.is_featured || false}
            onChange={async (e) => {
              const newValue = e.target.checked
              setFeaturedError('')
              
              // Если пытаемся установить, проверяем лимит
              if (newValue && !product?.is_featured) {
                try {
                  // Проверяем количество популярных товаров
                  const response = await api.get('/api/v1/products?per_page=1000')
                  const featuredCount = (response.data.data || []).filter((p: any) => p.is_featured && p.id !== product?.id).length
                  
                  if (featuredCount >= 3) {
                    setFeaturedError('Максимум 3 товара могут быть популярными. Сначала снимите отметку с другого товара.')
                    return
                  }
                } catch (error) {
                  console.error('Failed to check featured count:', error)
                }
              }
              
              setFormData({ ...formData, is_featured: newValue })
            }}
            className="w-4 h-4"
          />
          <span>Популярный товар (максимум 3)</span>
        </label>
        {featuredError && (
          <p className="text-red-600 text-sm mt-1">{featuredError}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold mb-2">Описание</label>
        <textarea
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value || null })}
          className="w-full px-4 py-2 border border-gray-300 rounded"
          rows={4}
        />
      </div>

      {/* Управление изображениями */}
      <div>
        <label className="block font-semibold mb-4">Изображения товара</label>
        
        {/* Основное изображение */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Основное изображение (первое в списке)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, true)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {images.length > 0 && (
            <div className="mt-4">
              <div className="relative inline-block">
                  <img
                    src={images[0].url}
                    alt="Основное изображение"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-blue-500"
                    onError={(e) => {
                      console.error('Failed to load image:', images[0].url)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs text-center py-1 rounded-b-lg">
                  Основное
                </span>
              </div>
            </div>
          )}
          {uploading && (
            <p className="text-sm text-blue-600 mt-2">Загрузка изображения...</p>
          )}
        </div>

        {/* Дополнительные изображения */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Дополнительные изображения
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleImageUpload(e, false)}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
          />
          {uploading && (
            <p className="text-sm text-gray-500 mt-2">Загрузка изображений...</p>
          )}
        </div>

        {/* Список всех изображений */}
        {images.length > 1 && (
          <div className="mt-6">
            <label className="block text-sm font-medium mb-3 text-gray-700">
              Все изображения (можно перетаскивать для изменения порядка)
            </label>
            <div className="grid grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={`image-${index}-${image.url}`} className="relative group">
                  <img
                    src={image.url}
                    alt={`Изображение ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                    onError={(e) => {
                      console.error('Failed to load image:', image.url)
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 flex gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index - 1)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          title="Переместить влево"
                        >
                          ←
                        </button>
                      )}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, index + 1)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                          title="Переместить вправо"
                        >
                          →
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                        title="Удалить"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Основное
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Нет загруженных изображений. Загрузите основное изображение выше.
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block font-semibold">Технические характеристики</label>
          <button
            type="button"
            onClick={addSpecItem}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            + Добавить параметр
          </button>
        </div>
        <div className="space-y-3">
          {technicalSpecs.map((spec, index) => (
            <div key={`spec-${index}-${spec.key || ''}`} className="flex gap-3 items-start">
              <div className="flex-1">
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) => updateSpecItem(index, 'key', e.target.value)}
                  placeholder="Название параметра"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) => updateSpecItem(index, 'value', e.target.value)}
                  placeholder="Значение"
                  className="w-full px-4 py-2 border border-gray-300 rounded"
                />
              </div>
              <button
                type="button"
                onClick={() => removeSpecItem(index)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Удалить
              </button>
            </div>
          ))}
          {technicalSpecs.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              Нет добавленных параметров. Нажмите «Добавить параметр» для создания.
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Добавьте параметры и их значения. Они будут отображаться в таблице технических характеристик на странице товара.
        </p>
      </div>

      <div>
        <label className="block font-semibold mb-2">Гарантия</label>
        <textarea
          value={warranty}
          onChange={(e) => setWarranty(e.target.value)}
          placeholder="Введите информацию о гарантии товара..."
          className="w-full px-4 py-2 border border-gray-300 rounded"
          rows={4}
        />
        <p className="text-sm text-gray-500 mt-2">
          Укажите информацию о гарантии товара. Она будет отображаться на странице товара во вкладке «Гарантия».
        </p>
      </div>

      {/* Фильтры */}
      {filters.length > 0 && (
        <div>
          <label className="block font-semibold mb-4">Фильтры</label>
          <div className="space-y-4">
            {filters.map((filter) => (
              <div key={filter.id} className="border border-gray-200 rounded p-4">
                <h4 className="font-semibold mb-3">{filter.name}</h4>
                <div className="space-y-2">
                  {filter.values
                    .filter((v: any) => v.is_active !== false)
                    .map((value, index) => (
                      <label key={value.id || `filter-${filter.id}-value-${index}`} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={(formData.filter_value_ids || []).includes(value.id)}
                          onChange={() => toggleFilterValue(value.id)}
                          className="w-4 h-4"
                        />
                        <span>{value.display_name || value.value}</span>
                      </label>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <button type="submit" className="btn-primary">
          {product?.id ? 'Сохранить' : 'Создать'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Отмена
        </button>
      </div>
    </form>
  )
}

