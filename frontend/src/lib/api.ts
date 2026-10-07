import axios from 'axios'
import demoAdapter from './demo-adapter'

export const isDemo = process.env.NEXT_PUBLIC_DEMO === '1'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Демо-режим для превью без базы: запросы не уходят в сеть, данные лежат в lib/demo-data.ts
if (isDemo) {
  api.defaults.adapter = demoAdapter
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Если это FormData, удаляем Content-Type чтобы axios установил его автоматически с boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

export default api
