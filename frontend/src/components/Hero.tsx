'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const HERO_IMAGE = process.env.NEXT_PUBLIC_HERO_IMAGE || '/images/hero.svg'

export default function Hero() {
  const heroImage = HERO_IMAGE

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-white mb-8 max-w-4xl mx-auto">
            LED-освещение нового уровня
          </h1>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              href="/catalog" 
              className="px-8 py-4 font-montserrat text-base font-medium bg-white text-text-primary rounded-lg hover:bg-white/95 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Смотреть каталог
            </Link>
            <Link 
              href="/#contacts" 
              className="px-8 py-4 font-montserrat text-base font-medium text-white border-2 border-white rounded-lg hover:bg-white/10 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Связаться с нами
            </Link>
          </div>
        </motion.div>
      </div>
      
      {/* Анимированная стрелка вниз - только на мобильных и планшетах */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 lg:hidden"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="cursor-pointer"
          onClick={() => {
            window.scrollTo({
              top: window.innerHeight,
              behavior: 'smooth'
            })
          }}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

