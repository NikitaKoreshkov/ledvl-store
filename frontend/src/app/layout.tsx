import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
})

const playfair = Playfair_Display({
  subsets: ['latin', 'cyrillic'],
  weight: ['600', '700'],
  variable: '--font-playfair',
})

const montserrat = Montserrat({
  subsets: ['latin', 'cyrillic'],
  weight: ['100', '200', '300', '400', '500', '600'],
  variable: '--font-montserrat',
})

// Без этого мета браузер разворачивает страницу на 980px и телефон показывает
// обрезанный первый экран
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Led VL — Премиальные осветительные приборы',
  description: 'Продажа осветительных приборов во Владивостоке и Приморском крае',
  keywords: 'освещение, светильники, LED, Владивосток, Приморский край',
  openGraph: {
    title: 'Led VL — Премиальные осветительные приборы',
    description: 'Продажа осветительных приборов во Владивостоке и Приморском крае',
    type: 'website',
    locale: 'ru_RU',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}

