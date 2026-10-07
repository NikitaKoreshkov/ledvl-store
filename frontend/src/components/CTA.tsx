'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="py-32 bg-gradient-to-b from-white via-background-main to-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.1) 0%, transparent 70%)'
        }} />
      </div>
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto text-center bg-white rounded-3xl p-16 md:p-20 shadow-2xl border border-gray-100/50 relative overflow-hidden group"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-100/30 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <motion.h2
            className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold mb-8 text-text-primary relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Готовы начать?
          </motion.h2>
          
          <motion.p
            className="text-lg md:text-xl text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed relative z-10 font-montserrat font-extralight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Свяжитесь с нами для консультации или просмотрите наш каталог
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link
              href="/#contacts"
              className="px-10 py-5 font-montserrat text-base font-extralight bg-text-primary text-white rounded-lg hover:bg-text-primary/90 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Связаться с нами
            </Link>
            <Link
              href="/catalog"
              className="px-10 py-5 font-montserrat text-base font-extralight text-text-primary border-2 border-text-primary rounded-lg hover:bg-text-primary hover:text-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Перейти в каталог
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

