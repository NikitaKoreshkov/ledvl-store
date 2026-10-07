'use client'

import { motion } from 'framer-motion'

const values = [
  {
    title: 'Качество',
    description: 'Работаем только с проверенными производителями и предлагаем сертифицированную продукцию высочайшего качества',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Опыт',
    description: 'Многолетний опыт работы на рынке осветительного оборудования во Владивостоке и Приморском крае',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    title: 'Сервис',
    description: 'Профессиональная консультация, гарантийное обслуживание и поддержка на всех этапах сотрудничества',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
]

const stats = [
  { number: '5+', label: 'Лет на рынке' },
  { number: '1000+', label: 'Довольных клиентов' },
  { number: '500+', label: 'Товаров в каталоге' },
  { number: '24/7', label: 'Поддержка' },
]

export default function AboutUs() {
  return (
    <section id="about" className="py-24 bg-background-main relative overflow-hidden">
      {/* Декоративные элементы */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-text-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-soft rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Заголовок */}
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary">
              О нас
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-transparent via-text-primary to-transparent mx-auto mb-8" />
            <p className="text-text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              Led VL — ваш надежный партнер в мире премиального освещения
            </p>
          </motion.div>

          {/* Основной контент */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Левая колонка - Текст */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <h3 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-6">
                  Премиальное освещение для вашего комфорта
                </h3>
                <p className="text-lg text-text-muted leading-relaxed">
                  Led VL — это компания, специализирующаяся на продаже премиальных осветительных приборов
                  во Владивостоке и Приморском крае. Мы предлагаем широкий ассортимент LED-светильников,
                  солнечных светильников и другого осветительного оборудования для дома и бизнеса.
                </p>
                <p className="text-lg text-text-muted leading-relaxed">
                  Наша миссия — обеспечить наших клиентов качественным освещением по доступным ценам
                  с гарантией и профессиональным сервисом. Мы тщательно отбираем каждый продукт,
                  чтобы предложить вам только лучшее.
                </p>
                <p className="text-lg text-text-muted leading-relaxed">
                  С нами вы получаете не просто товар, а комплексное решение для создания уютной
                  и функциональной световой среды в вашем доме или офисе.
                </p>
              </div>
            </motion.div>

            {/* Правая колонка - Ценности */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-soft/20 to-accent-soft/10 flex items-center justify-center text-text-primary group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {value.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-serif text-xl font-bold text-text-primary mb-2">
                        {value.title}
                      </h4>
                      <p className="text-text-muted leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Статистика */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="font-serif text-4xl md:text-5xl font-bold text-text-primary mb-2 group-hover:text-accent-soft transition-colors duration-300">
                  {stat.number}
                </div>
                <div className="text-text-muted font-montserrat font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

