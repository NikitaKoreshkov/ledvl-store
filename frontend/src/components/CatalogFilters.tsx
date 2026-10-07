'use client'

import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { motion, AnimatePresence } from 'framer-motion'

interface Filter {
  id: string
  name: string
  type: 'select' | 'checkbox' | 'range' | 'text'
  category_id: string | null
  values: FilterValue[]
}

interface FilterValue {
  id: string
  value: string
  display_name: string | null
  min_value: number | null
  max_value: number | null
  is_active?: boolean
}

interface CatalogFiltersProps {
  categoryId?: string
  filters: Record<string, any>
  onFiltersChange: (filters: Record<string, any>) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function CatalogFilters({ categoryId, filters, onFiltersChange, searchQuery = '', onSearchChange }: CatalogFiltersProps) {
  const [availableFilters, setAvailableFilters] = useState<Filter[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedFilters, setExpandedFilters] = useState<Set<string>>(new Set())
  const [searchValue, setSearchValue] = useState(searchQuery)

  useEffect(() => {
    loadFilters()
  }, [categoryId])

  const toggleFilter = (filterId: string) => {
    setExpandedFilters(prev => {
      const newSet = new Set(prev)
      if (newSet.has(filterId)) {
        newSet.delete(filterId)
      } else {
        newSet.add(filterId)
      }
      return newSet
    })
  }

  const loadFilters = async () => {
    setLoading(true)
    try {
      const url = categoryId 
        ? `/api/v1/filters?category=${categoryId}`
        : '/api/v1/filters'
      const response = await api.get(url)
      setAvailableFilters(response.data || [])
    } catch (error) {
      console.error('Failed to load filters:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateFilter = useCallback((key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    // Удаляем пустые значения
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k] === '' || newFilters[k] === null || newFilters[k] === undefined || 
          (Array.isArray(newFilters[k]) && newFilters[k].length === 0)) {
        delete newFilters[k]
      }
    })
    onFiltersChange(newFilters)
  }, [filters, onFiltersChange])

  const resetFilters = () => {
    onFiltersChange({})
    setSearchValue('')
    if (onSearchChange) {
      onSearchChange('')
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  useEffect(() => {
    setSearchValue(searchQuery)
  }, [searchQuery])

  if (loading) {
    return (
      <div className="p-6">
        <h2 className="font-serif text-2xl font-bold mb-6">Фильтры</h2>
        <p className="text-text-muted text-sm">Загрузка фильтров...</p>
      </div>
    )
  }

  if (availableFilters.length === 0) {
    return (
      <div className="p-6">
        <h2 className="font-serif text-2xl font-bold mb-6">Фильтры</h2>
        <p className="text-text-muted text-sm">Фильтры не настроены</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-text-primary mb-4">Фильтры</h2>
        
        {/* Общий поиск по названию */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Поиск проектов..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none text-sm"
          />
        </div>
      </div>
      
      <div className="space-y-0">
        {availableFilters.map((filter, index) => (
          <div key={filter.id} className="border-b border-gray-200 last:border-b-0">
            <FilterField
              filter={filter}
              value={filters[filter.id]}
              onChange={(value) => updateFilter(filter.id, value)}
              isExpanded={expandedFilters.has(filter.id)}
              onToggle={() => toggleFilter(filter.id)}
            />
          </div>
        ))}
      </div>

      {/* Кнопка сбросить внизу */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={resetFilters}
          className="w-full text-sm text-text-muted hover:text-text-primary transition-colors py-2"
        >
          Сбросить всё
        </button>
      </div>
    </div>
  )
}

function FilterField({ filter, value, onChange, isExpanded, onToggle }: {
  filter: Filter
  value: any
  onChange: (value: any) => void
  isExpanded: boolean
  onToggle: () => void
}) {
  const [selectOpen, setSelectOpen] = useState(false)
  const [activeSlider, setActiveSlider] = useState<'min' | 'max' | null>(null)
  
  // Закрываем select при клике вне его
  useEffect(() => {
    if (!selectOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.custom-select-container')) {
        setSelectOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [selectOpen])
  const selectedValue = filter.values.find(v => v.id === value)
  const displayText = selectedValue ? (selectedValue.display_name || selectedValue.value) : 'Все'

  const renderContent = () => {
    if (filter.type === 'select') {
      return (
        <div className="relative custom-select-container">
          <button
            type="button"
            onClick={() => setSelectOpen(!selectOpen)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-left flex items-center justify-between bg-white focus:outline-none"
            onMouseDown={(e) => e.preventDefault()}
          >
            <span className="font-medium">{displayText}</span>
            <svg
              className={`w-4 h-4 text-text-muted transition-transform ${selectOpen ? 'transform rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {selectOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
              >
                <button
                  type="button"
                  onClick={() => {
                    onChange(null)
                    setSelectOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    !value ? 'bg-gray-50 font-medium' : ''
                  }`}
                >
                  Все
                </button>
                {filter.values
                  .filter(v => v.is_active !== false)
                  .map((val) => (
                    <button
                      key={val.id}
                      type="button"
                      onClick={() => {
                        onChange(val.id)
                        setSelectOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        value === val.id ? 'bg-gray-50 font-medium' : ''
                      }`}
                    >
                      {val.display_name || val.value}
                    </button>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )
    }

    if (filter.type === 'checkbox') {
      return (
        <div className="space-y-2 max-h-64 overflow-y-auto py-2">
          {filter.values
            .filter(v => v.is_active !== false)
            .map((val) => (
              <label key={val.id} className="flex items-center space-x-2 cursor-pointer py-1">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-text-primary accent-text-primary"
                  checked={(value || []).includes(val.id)}
                  onChange={(e) => {
                    const current = value || []
                    if (e.target.checked) {
                      onChange([...current, val.id])
                    } else {
                      onChange(current.filter((id: string) => id !== val.id))
                    }
                  }}
                />
                <span className="text-sm text-text-primary">{val.display_name || val.value}</span>
              </label>
            ))}
        </div>
      )
    }

    if (filter.type === 'range') {
      const rangeValue = filter.values[0]
      // Используем значения из настроек фильтра
      const minLimit = rangeValue?.min_value ?? 0
      const maxLimit = rangeValue?.max_value ?? 100000
      
      const currentMin = value?.min ?? minLimit
      const currentMax = value?.max ?? maxLimit

      const handleMinChange = (newMin: number) => {
        const clampedMin = Math.min(Math.max(newMin, minLimit), currentMax)
        onChange({ ...value, min: clampedMin === minLimit ? null : clampedMin })
      }

      const handleMaxChange = (newMax: number) => {
        const clampedMax = Math.max(Math.min(newMax, maxLimit), currentMin)
        onChange({ ...value, max: clampedMax === maxLimit ? null : clampedMax })
      }

      const minPercent = ((currentMin - minLimit) / (maxLimit - minLimit)) * 100
      const maxPercent = ((currentMax - minLimit) / (maxLimit - minLimit)) * 100

      const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mousePercent = (mouseX / rect.width) * 100
        const mouseValue = minLimit + (mousePercent / 100) * (maxLimit - minLimit)
        
        const minDistance = Math.abs(mouseValue - currentMin)
        const maxDistance = Math.abs(mouseValue - currentMax)
        
        // Определяем, какой слайдер ближе к курсору
        if (minDistance < maxDistance) {
          setActiveSlider('min')
        } else {
          setActiveSlider('max')
        }
      }

      const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Проверяем, не кликнули ли мы на сам input
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT') {
          return // Пусть input обрабатывает клик сам
        }
        
        const rect = e.currentTarget.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const mousePercent = (mouseX / rect.width) * 100
        const mouseValue = minLimit + (mousePercent / 100) * (maxLimit - minLimit)
        
        // Определяем, в какой части трека был клик
        const midPoint = (minPercent + maxPercent) / 2
        
        if (mousePercent < midPoint) {
          // Клик в левой части - активируем левый слайдер
          setActiveSlider('min')
          handleMinChange(mouseValue)
        } else {
          // Клик в правой части - активируем правый слайдер
          setActiveSlider('max')
          handleMaxChange(mouseValue)
        }
      }

      return (
        <div className="py-4">
          <div 
            className="relative mb-4 h-6 flex items-center cursor-pointer"
            onMouseMove={handleMouseMove}
            onClick={handleContainerClick}
            onMouseLeave={() => setActiveSlider(null)}
          >
            {/* Track */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 rounded-full transform -translate-y-1/2"></div>
            {/* Active range */}
            <div
              className="absolute top-1/2 h-1 bg-text-primary rounded-full transform -translate-y-1/2 pointer-events-none"
              style={{
                left: `${minPercent}%`,
                width: `${maxPercent - minPercent}%`,
              }}
            ></div>
            {/* Max handle - рендерим первым, чтобы был ниже */}
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step={Math.max(1, Math.floor((maxLimit - minLimit) / 1000))}
              value={currentMax}
              onChange={(e) => {
                e.stopPropagation()
                handleMaxChange(Number(e.target.value))
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
                setActiveSlider('max')
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerUp={(e) => {
                e.stopPropagation()
                e.currentTarget.releasePointerCapture(e.pointerId)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                setActiveSlider('max')
              }}
              onMouseUp={(e) => {
                e.stopPropagation()
              }}
              className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer slider-thumb"
              style={{
                zIndex: activeSlider === 'max' ? 10 : 5,
                pointerEvents: activeSlider === 'min' ? 'none' : 'auto',
              }}
            />
            {/* Min handle - рендерим вторым, чтобы был выше */}
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step={Math.max(1, Math.floor((maxLimit - minLimit) / 1000))}
              value={currentMin}
              onChange={(e) => {
                e.stopPropagation()
                handleMinChange(Number(e.target.value))
              }}
              onPointerDown={(e) => {
                e.stopPropagation()
                setActiveSlider('min')
                e.currentTarget.setPointerCapture(e.pointerId)
              }}
              onPointerUp={(e) => {
                e.stopPropagation()
                e.currentTarget.releasePointerCapture(e.pointerId)
              }}
              onMouseDown={(e) => {
                e.stopPropagation()
                setActiveSlider('min')
              }}
              onMouseUp={(e) => {
                e.stopPropagation()
              }}
              className="absolute top-0 left-0 w-full h-6 bg-transparent appearance-none cursor-pointer slider-thumb"
              style={{
                zIndex: activeSlider === 'min' ? 10 : 6,
                pointerEvents: activeSlider === 'max' ? 'none' : 'auto',
              }}
            />
          </div>
          
          {/* Value display */}
          <div className="flex justify-between items-center text-sm text-text-muted">
            <span>{currentMin.toLocaleString('ru-RU')} ₽</span>
            <span>{currentMax.toLocaleString('ru-RU')} ₽</span>
          </div>

        </div>
      )
    }

    if (filter.type === 'text') {
      return (
        <input
          type="text"
          placeholder="Поиск..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-primary text-sm"
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
        />
      )
    }

    return null
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 px-0 text-left"
      >
        <h3 className="font-semibold text-text-primary text-base">{filter.name}</h3>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">
              {renderContent()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
