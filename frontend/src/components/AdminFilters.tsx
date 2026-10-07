'use client'

import { useState, useEffect } from 'react'
import api from '@/lib/api'

interface Filter {
  id: string
  name: string
  type: 'select' | 'checkbox' | 'range' | 'text'
  category_id: string | null
  sort_order: number
  is_active: boolean
  values: FilterValue[]
}

interface FilterValue {
  id: string
  value: string
  display_name: string | null
  sort_order: number
  is_active: boolean
  min_value: number | null
  max_value: number | null
}

interface Category {
  id: string
  name: string
}

export default function AdminFilters() {
  const [filters, setFilters] = useState<Filter[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [editingFilter, setEditingFilter] = useState<Filter | null>(null)
  const [showAddFilter, setShowAddFilter] = useState(false)

  useEffect(() => {
    loadFilters()
    loadCategories()
  }, [])

  const loadFilters = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/v1/filters')
      setFilters(response.data || [])
    } catch (error) {
      console.error('Failed to load filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await api.get('/api/v1/categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  const handleCreateFilter = async (data: Partial<Filter>) => {
    try {
      const response = await api.post('/api/v1/filters', data)
      await loadFilters()
      // После создания открываем фильтр для редактирования
      const newFilter = response.data
      if (newFilter) {
        setShowAddFilter(false)
        setEditingFilter(newFilter)
      }
    } catch (error) {
      console.error('Failed to create filter:', error)
    }
  }

  const handleUpdateFilter = async (id: string, data: Partial<Filter>) => {
    try {
      await api.put(`/api/v1/filters/${id}`, data)
      await loadFilters()
      setEditingFilter(null)
    } catch (error) {
      console.error('Failed to update filter:', error)
    }
  }

  const handleDeleteFilter = async (id: string) => {
    if (!confirm('Удалить фильтр?')) return
    try {
      await api.delete(`/api/v1/filters/${id}`)
      await loadFilters()
    } catch (error) {
      console.error('Failed to delete filter:', error)
    }
  }

  const handleAddValue = async (filterId: string, value: Partial<FilterValue>) => {
    try {
      const response = await api.post(`/api/v1/filters/${filterId}/values`, value)
      await loadFilters()
      // Обновляем editingFilter, чтобы компонент получил актуальные данные
      if (editingFilter?.id === filterId) {
        const updatedFilters = await api.get('/api/v1/filters')
        const updatedFilter = updatedFilters.data.find((f: Filter) => f.id === filterId)
        if (updatedFilter) {
          setEditingFilter(updatedFilter)
        }
      }
    } catch (error) {
      console.error('Failed to add value:', error)
    }
  }

  const handleUpdateValue = async (valueId: string, data: Partial<FilterValue>) => {
    try {
      await api.put(`/api/v1/filters/values/${valueId}`, data)
      await loadFilters()
      // Обновляем editingFilter, чтобы компонент получил актуальные данные
      if (editingFilter) {
        const updatedFilters = await api.get('/api/v1/filters')
        const updatedFilter = updatedFilters.data.find((f: Filter) => f.id === editingFilter.id)
        if (updatedFilter) {
          setEditingFilter(updatedFilter)
        }
      }
    } catch (error) {
      console.error('Failed to update value:', error)
    }
  }

  const handleDeleteValue = async (valueId: string) => {
    if (!valueId) {
      console.error('Cannot delete value: ID is missing')
      return
    }
    if (!confirm('Удалить значение?')) return
    try {
      await api.delete(`/api/v1/filters/values/${valueId}`)
      await loadFilters()
    } catch (error) {
      console.error('Failed to delete value:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-xl font-bold">Фильтры</h3>
        <button
          onClick={() => setShowAddFilter(true)}
          className="btn-primary"
        >
          Добавить фильтр
        </button>
      </div>

      {showAddFilter && (
        <FilterForm
          categories={categories}
          onSave={async (data) => {
            await handleCreateFilter(data)
          }}
          onCancel={() => setShowAddFilter(false)}
        />
      )}

      {filters.map((filter) => (
        <div key={filter.id} className="card p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-semibold">{filter.name}</h4>
              <p className="text-sm text-text-muted">
                Тип: {filter.type === 'select' ? 'Выбор' : filter.type === 'checkbox' ? 'Чекбоксы' : filter.type === 'range' ? 'Диапазон' : 'Текст'}
                {filter.category_id && ` • Категория: ${categories.find(c => c.id === filter.category_id)?.name || filter.category_id}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditingFilter(editingFilter?.id === filter.id ? null : filter)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {editingFilter?.id === filter.id ? 'Свернуть' : 'Редактировать'}
              </button>
              <button
                onClick={() => handleDeleteFilter(filter.id)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Удалить
              </button>
            </div>
          </div>

          {editingFilter?.id === filter.id ? (
            <FilterForm
              filter={filter}
              categories={categories}
              onSave={(data) => handleUpdateFilter(filter.id, data)}
              onCancel={() => setEditingFilter(null)}
              onAddValue={(value) => handleAddValue(filter.id, value)}
              onUpdateValue={handleUpdateValue}
              onDeleteValue={handleDeleteValue}
            />
          ) : (
            <div className="space-y-2">
              <div className="text-sm font-semibold mb-2">Значения:</div>
              {filter.values && filter.values.length > 0 ? (
                filter.values
                  .filter(v => v.is_active !== false)
                  .map((value, index) => (
                  <div key={value.id || `filter-${filter.id}-value-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span>{value.display_name || value.value}</span>
                    {value.id && (
                      <button
                        onClick={() => handleDeleteValue(value.id)}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted">Нет значений. Нажмите «Редактировать» для добавления.</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function FilterForm({ filter, categories, onSave, onCancel, onAddValue, onUpdateValue, onDeleteValue }: {
  filter?: Filter
  categories: Category[]
  onSave: (data: Partial<Filter>) => void
  onCancel: () => void
  onAddValue?: (value: Partial<FilterValue>) => void
  onUpdateValue?: (valueId: string, value: Partial<FilterValue>) => void
  onDeleteValue?: (valueId: string) => void
}) {
  const [name, setName] = useState(filter?.name || '')
  const [type, setType] = useState<Filter['type']>(filter?.type || 'select')
  const [categoryId, setCategoryId] = useState(filter?.category_id || '')

  return (
    <div className="card p-4 bg-gray-50">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Название фильтра</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
            placeholder="Например: Цвет"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Тип</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Filter['type'])}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="select">Выбор (Select)</option>
            <option value="checkbox">Чекбоксы</option>
            <option value="range">Диапазон</option>
            <option value="text">Текст (поиск)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Категория (необязательно)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value || '')}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Все категории</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Настройки значений в зависимости от типа */}
        {type === 'select' && (
          <div className="border-t pt-4 mt-4">
            {filter && onAddValue && onDeleteValue ? (
              <SelectValuesSettings filter={filter} onAddValue={onAddValue} onDeleteValue={onDeleteValue} />
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                Сохраните фильтр, чтобы добавить варианты выбора
              </div>
            )}
          </div>
        )}

        {type === 'checkbox' && (
          <div className="border-t pt-4 mt-4">
            {filter && onAddValue && onDeleteValue ? (
              <CheckboxValuesSettings filter={filter} onAddValue={onAddValue} onDeleteValue={onDeleteValue} />
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                Сохраните фильтр, чтобы добавить чекбоксы
              </div>
            )}
          </div>
        )}

        {type === 'range' && (
          <div className="border-t pt-4 mt-4">
            {filter && onAddValue && onUpdateValue && onDeleteValue ? (
              <RangeFilterSettings filter={filter} onAddValue={onAddValue} onUpdateValue={onUpdateValue} onDeleteValue={onDeleteValue} />
            ) : (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                Сохраните фильтр, чтобы настроить диапазон
              </div>
            )}
          </div>
        )}

        {type === 'text' && (
          <div className="border-t pt-4 mt-4">
            <TextFilterSettings />
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => onSave({ name, type, category_id: categoryId || null })}
            className="btn-primary"
          >
            Сохранить
          </button>
          <button onClick={onCancel} className="btn-secondary">
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckboxValuesSettings({ filter, onAddValue, onDeleteValue }: {
  filter: Filter
  onAddValue: (value: Partial<FilterValue>) => void
  onDeleteValue: (valueId: string) => void
}) {
  const [value, setValue] = useState('')
  const [displayName, setDisplayName] = useState('')

  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-sm">Чекбоксы:</h5>
      {filter.values && filter.values.length > 0 ? (
        <div className="space-y-2">
          {filter.values
            .filter(v => v.is_active !== false)
            .map((val, index) => (
            <div key={val.id || `checkbox-value-${index}`} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
              <div>
                <span className="font-medium">{val.display_name || val.value}</span>
                {val.display_name && val.value !== val.display_name && (
                  <span className="text-xs text-gray-500 ml-2">({val.value})</span>
                )}
              </div>
              {val.id && (
                <button
                  onClick={() => onDeleteValue(val.id)}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Нет значений</p>
      )}
      <div className="flex gap-2 pt-2 border-t">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Значение (например: red)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Отображаемое название (например: Красный)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <button
          onClick={() => {
            if (value.trim()) {
              onAddValue({ value: value.trim(), display_name: displayName.trim() || null })
              setValue('')
              setDisplayName('')
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
        >
          Добавить
        </button>
      </div>
    </div>
  )
}

function SelectValuesSettings({ filter, onAddValue, onDeleteValue }: {
  filter: Filter
  onAddValue: (value: Partial<FilterValue>) => void
  onDeleteValue: (valueId: string) => void
}) {
  const [value, setValue] = useState('')
  const [displayName, setDisplayName] = useState('')

  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-sm">Варианты выбора:</h5>
      {filter.values && filter.values.length > 0 ? (
        <div className="space-y-2">
          {filter.values
            .filter(v => v.is_active !== false)
            .map((val, index) => (
            <div key={val.id || `select-value-${index}`} className="flex justify-between items-center p-2 bg-white border border-gray-200 rounded">
              <div>
                <span className="font-medium">{val.display_name || val.value}</span>
                {val.display_name && val.value !== val.display_name && (
                  <span className="text-xs text-gray-500 ml-2">({val.value})</span>
                )}
              </div>
              {val.id && (
                <button
                  onClick={() => onDeleteValue(val.id)}
                  className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                >
                  Удалить
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Нет значений</p>
      )}
      <div className="flex gap-2 pt-2 border-t">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Значение (например: red)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Отображаемое название (например: Красный)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <button
          onClick={() => {
            if (value.trim()) {
              onAddValue({ value: value.trim(), display_name: displayName.trim() || null })
              setValue('')
              setDisplayName('')
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
        >
          Добавить
        </button>
      </div>
    </div>
  )
}

function RangeFilterSettings({ filter, onAddValue, onUpdateValue, onDeleteValue }: {
  filter: Filter
  onAddValue: (value: Partial<FilterValue>) => void
  onUpdateValue: (valueId: string, value: Partial<FilterValue>) => void
  onDeleteValue: (valueId: string) => void
}) {
  // Загружаем существующие значения диапазона - пересчитываем при изменении filter.values
  const existingRange = filter.values?.find(v => v.min_value !== null || v.max_value !== null)
  
  const [minValue, setMinValue] = useState<number | ''>(existingRange?.min_value ?? '')
  const [maxValue, setMaxValue] = useState<number | ''>(existingRange?.max_value ?? '')

  // Обновляем значения при изменении filter.values
  useEffect(() => {
    const currentRange = filter.values?.find(v => v.min_value !== null || v.max_value !== null)
    if (currentRange) {
      setMinValue(currentRange.min_value ?? '')
      setMaxValue(currentRange.max_value ?? '')
    } else {
      setMinValue('')
      setMaxValue('')
    }
  }, [filter.values])

  const handleSave = () => {
    if (minValue === '' && maxValue === '') return
    
    const rangeData = {
      value: `range_${filter.id}`,
      display_name: null,
      min_value: minValue !== '' ? Number(minValue) : null,
      max_value: maxValue !== '' ? Number(maxValue) : null,
    }


    const currentRange = filter.values?.find(v => v.min_value !== null || v.max_value !== null)
    if (currentRange && currentRange.id) {
      onUpdateValue(currentRange.id, rangeData)
    } else {
      onAddValue(rangeData)
    }
  }

  // Пересчитываем existingRange для отображения актуальных значений
  const currentRange = filter.values?.find(v => v.min_value !== null || v.max_value !== null)

  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-sm">Настройки диапазона:</h5>
      {currentRange && (
        <div className="p-3 bg-white border border-gray-200 rounded">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">
                От {currentRange.min_value ?? 'не указано'} до {currentRange.max_value ?? 'не указано'}
              </span>
            </div>
            {currentRange.id && (
              <button
                onClick={() => {
                  onDeleteValue(currentRange.id)
                  setMinValue('')
                  setMaxValue('')
                }}
                className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
              >
                Удалить
              </button>
            )}
          </div>
        </div>
      )}
      <div className="flex gap-2 pt-2 border-t">
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Минимальное значение</label>
          <input
            type="number"
            value={minValue}
            onChange={(e) => setMinValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-600 mb-1">Максимальное значение</label>
          <input
            type="number"
            value={maxValue}
            onChange={(e) => setMaxValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="10000"
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 whitespace-nowrap"
          >
            {existingRange ? 'Обновить' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TextFilterSettings() {
  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-sm">Настройки текстового поиска:</h5>
      <div className="p-3 bg-gray-50 border border-gray-200 rounded">
        <p className="text-sm text-gray-600">
          Текстовый фильтр позволяет пользователям искать товары по текстовому запросу.
          Дополнительные настройки не требуются.
        </p>
      </div>
    </div>
  )
}

