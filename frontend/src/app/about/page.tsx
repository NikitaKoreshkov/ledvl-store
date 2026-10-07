import type { Metadata } from 'next'
import AboutUs from '@/components/AboutUs'

export const metadata: Metadata = {
  title: 'О нас — Led VL',
  description: 'Информация о компании Led VL',
}

// Секция «О нас» с главной живёт в AboutUs: отдельная страница брала её же,
// но только текстом без оформления.
export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background-main pt-16">
      <AboutUs />
    </main>
  )
}
