'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false)
      }
    }
    
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEscape)
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 glass border-b border-white/10 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-full px-6 md:px-8 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Логотип */}
            <div className="flex justify-start">
              <button
                onClick={() => {
                  window.location.href = '/'
                }}
                className="flex items-center space-x-3"
              >
                <span className="text-2xl font-serif font-bold text-accent-dark">Led VL</span>
              </button>
            </div>

            {/* Центральная навигация - только на десктопе (lg+) */}
            <nav className="hidden lg:flex items-center justify-center space-x-20">
              <Link href="/#about" className="text-text-primary font-montserrat relative pb-1 group">
                <span>О нас</span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-text-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/catalog" className="text-text-primary font-montserrat relative pb-1 group">
                <span>Каталог</span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-text-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/#contacts" className="text-text-primary font-montserrat relative pb-1 group">
                <span>Контакты</span>
                <span className="absolute bottom-0 left-0 w-0 h-px bg-text-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            </nav>

            {/* Кнопки и бургер */}
            <div className="flex items-center justify-end space-x-4">
              {/* Кнопки - видны на планшете (md+) и десктопе, скрыты на мобиле */}
              <div className="hidden md:flex items-center space-x-4">
                <Link
                  href="/cart"
                  className="px-6 py-2.5 font-montserrat text-sm font-medium text-text-primary border border-text-primary/20 rounded-lg hover:border-text-primary/40 hover:bg-text-primary/5 transition-all duration-300"
                >
                  Корзина
                </Link>
                <Link
                  href="/#contacts"
                  className="px-6 py-2.5 font-montserrat text-sm font-medium bg-text-primary text-white rounded-lg hover:bg-text-primary/90 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  Связаться с нами
                </Link>
              </div>
              {/* Бургер - виден на планшете и мобиле (до lg) */}
              <button
                className="lg:hidden p-2 text-text-primary hover:text-gray-600 transition-colors relative z-[80]"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Меню"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Полноэкранное мобильное меню */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Затемненный фон */}
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsMenuOpen(false)}
            />
            
            {/* Меню */}
            <motion.nav
              className="fixed inset-0 z-[70] lg:hidden flex flex-col bg-background-main"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Верхняя панель с логотипом и крестиком */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4">
                {/* Логотип */}
                <button
                  onClick={() => {
                    setIsMenuOpen(false)
                    window.location.href = '/'
                  }}
                  className="flex items-center space-x-3"
                >
                  <span className="text-2xl font-serif font-bold text-accent-dark">Led VL</span>
                </button>
                
                {/* Крестик для закрытия */}
                <button
                  className="p-2 text-text-primary hover:text-gray-600 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Закрыть меню"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Контент меню - центрирован */}
              <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto px-6">
                {/* Навигационные ссылки */}
                <div className="flex flex-col space-y-6 mb-8 w-full">
                  <Link 
                    href="/#about" 
                    className="text-2xl text-text-primary font-montserrat font-medium relative pb-2 group text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>О нас</span>
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-text-primary transition-all duration-300 group-hover:w-20"></span>
                  </Link>
                  <Link 
                    href="/catalog" 
                    className="text-2xl text-text-primary font-montserrat font-medium relative pb-2 group text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Каталог</span>
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-text-primary transition-all duration-300 group-hover:w-20"></span>
                  </Link>
                  <Link 
                    href="/#contacts" 
                    className="text-2xl text-text-primary font-montserrat font-medium relative pb-2 group text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span>Контакты</span>
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-text-primary transition-all duration-300 group-hover:w-20"></span>
                  </Link>
                </div>
                
                {/* Кнопки в меню */}
                <div className="flex flex-col space-y-4 pt-8 border-t border-white/20 w-full">
                  <Link
                    href="/cart"
                    className="px-8 py-3 font-montserrat text-base font-medium text-text-primary border border-text-primary/20 rounded-lg hover:border-text-primary/40 hover:bg-text-primary/5 transition-all duration-300 text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Корзина
                  </Link>
                  <Link
                    href="/#contacts"
                    className="px-8 py-3 font-montserrat text-base font-medium bg-text-primary text-white rounded-lg hover:bg-text-primary/90 transition-all duration-300 shadow-sm hover:shadow-md text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Связаться с нами
                  </Link>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

